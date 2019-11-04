let fs = require('fs');

exports.downloadFile = async function(fileid, filename, callback) {
    let parts = filename.split('.');
    let bufs = [], resData;
    return new Promise(function(resolve, reject){
    global.drive.files.get({fileId: fileid, alt: 'media'}, {responseType: 'stream'},
        function(err, res){
        res.data.on('data', function(data){
            bufs.push(data); 
        })
        .on('end', function(){
            resData = Buffer.concat(bufs);
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
  
exports.storeFiles = function(filename, data, parentFolderId) {
    let parts = filename.split('.');
    var fileMetadata = {
        'name': filename,
        'parents': [parentFolderId]
    };
    let mimeTypes = JSON.parse(fs.readFileSync('helpfulData/mimeTypes.json'));
    var media = {
        mimeType: mimeTypes[parts[1]],
        body: data
    };
    return new Promise(function(resolve, reject){
        drive.files.create({
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
  
exports.storeFiles = function(folderName, parentFolderId) {
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
        var previousParents = file.parents.join(',');
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