let fs = require('fs');
let gdCRUD = require('../googleDriveApi/googleDriveCRUD');
let splitFileName = require('./splitFileName');

exports.downloadModel = function(GDFolderName, localDirectory, filesStructure, modelName){
    return new Promise(async(resolve, reject)=>{
      let filesMetadata = [], result = [];
      await gdCRUD.listFiles(GDFolderName, true).then((data)=>{
        filesMetadata = data;
      });
      for (let i = 0; i < filesMetadata.length; i++) {
        await gdCRUD.listFiles(filesMetadata[i].id, false).then((files)=>{
          result.push({
            files: files
          });
        });
        if(filesStructure != undefined){
          let numberOfFiles = Array.from(new Set(Object.values(filesStructure))).length;
          if(result[i].files.length != numberOfFiles){
            console.log('ERROR! While downloading model!  ' + modelName +
            ` contains damaged object! Object '` + filesMetadata[i].name + `' is damaged`);
            Array.from(result[i]).pop();
            continue;
          }
        }
        let pathToFile = localDirectory + filesMetadata[i].name;
        result[i].pathToFile = pathToFile;
        fs.mkdirSync(pathToFile);
        for (let j = 0; j < result[i].files.length; j++) {
          await gdCRUD.downloadFile(result[i].files[j].id).then((downloadedData)=>{
            let filename;
            if(filesStructure != undefined){
              let ext = splitFileName.getExtension(result[i].files[j].name);
              filename = filesStructure[ext] + '.' + ext;
            }
            else
              filename = result[i].files[j].name;
            fs.writeFileSync(result[i].pathToFile + '/' + filename, downloadedData);
            console.log('Resolved ' + modelName);
          });
        }
      }
      resolve(1);
    });
}