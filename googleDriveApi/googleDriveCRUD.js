let fs = require('fs');
var stream = require('stream');
let path = require('path');

exports.downloadFile = function downloadFile(fileid, callback) {
    if(!callback)
        callback = ()=>{};
    let buffs = [];
    return new Promise(function(resolve, reject){
        global.drive.files.get({fileId: fileid, alt: 'media'}, {responseType: 'stream'},
        function(err, res){
            if(res == undefined)
                return downloadFile(fileid, callback);
            res.data.on('data', function(data){
                buffs.push(data); 
            })
            .on('end', function(){
                resData = Buffer.concat(buffs);
                resolve(resData);
            })
            .on('error', err => {
                console.log('Error', err);
            })
            .on('end', callback)
        });   
    })
}
  
exports.deleteFile = function(fileid) {
    global.drive.files.delete({
        fileId: fileid
    }, function(err, resp){
        if (err) {
            console.log('Error code:', err.code)
        } else {
            console.log('Successfully deleted');
        }
    });
}
  
exports.storeFile = function(filename, data, parentFolderId) {
    let parts = filename.split('.');
    var fileMetadata = {
        'name': filename,
        'parents': [parentFolderId]
    };
    let mimeTypes = JSON.parse(fs.readFileSync('helpfulData/mimeTypes.json'));
    let dataStream = new stream.PassThrough();
    dataStream.end(new Buffer.alloc(Array.from(data).length, data));
    var media = {
        mimeType: mimeTypes[parts[1]],
        body: dataStream
    };
    return new Promise(function(resolve, reject){
        global.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
        }, function (err, file) {
        if (err)
            console.error(err);
        else 
            console.log('File Id: ', file.data.id);
            resolve( file.data.id)
        });
    })
}
  
exports.createFolder = function(folderName, parentFolderId) {
    var fileMetadata = {
        'name': folderName,
        'mimeType': 'application/vnd.google-apps.folder',
        'parents': [parentFolderId]
    };
    return new Promise(function(resolve, reject){
        global.drive.files.create({
        resource: fileMetadata,
        fields: 'id'
        }, function (err, file) {
        if (err) {
            // Handle error
            console.error(err);
        } else {
            console.log('Folder Id: ', file.data.id);
            resolve(file.data.id);
        }
        });
    });
}
  
exports.moveFile = function(fileId, folderId) {
    // Retrieve the existing parents to remove
    global.drive.files.get({
        fileId: fileId,
        fields: 'parents'
    }, function (err, file) {
        if (err)
        console.error(err);
        else {
            // Move the file to the another folder
            var previousParents = file.data.parents.join(',');
            global.drive.files.update({
                fileId: fileId,
                addParents: folderId,
                removeParents: previousParents,
                fields: 'id, parents'
            }, function (err, file) {
                if (err) {
                console.error('Error while moving file: ' + err);
                } else
                console.log('File ' + fileId + ' has been succussfully moved to another folder');
            });
        }
    });
}

/**
* Lists the names and IDs of up to 100 files.
* @param {google.auth.OAuth2} auth An authorized OAuth2 client.
*/
exports.listFiles = function listFiles(folder, isName, callback) {
    if(!callback)
        callback = ()=>{};
    return new Promise(function(resolve, reject){
        let googleDriveCredentials = JSON.parse(fs.readFileSync(path.resolve('.') + '/credentials/googleDriveCredentials.json'));
        let query = isName == true ? googleDriveCredentials.folders[folder] : folder;
        // would like to replace it with classes if js had interfaces
        global.drive.files.list({
            q: `'${query}' in parents`,
            pageSize: 100,
            fields: 'nextPageToken, files(id, name)',
        }, function(err, res){
            if(res == undefined)
                return listFiles(folder, isName, callback);
            resolve(res.data.files)
        });
    })
}
