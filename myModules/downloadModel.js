let fs = require('fs');
let gdCRUD = require('../googleDriveApi/googleDriveCRUD');
let splitFileName = require('./splitFileName');

async function recursiveFunction(array, counter, foldersStructure
  , path, filesStructure, modelName) {
  console.log(counter);
  let buff = [];
  for (let i = 0; i < array.length; i++){
    await gdCRUD.listFiles(array[i].id, false).then((files)=>{
      buff = files;
    });
    if(counter < foldersStructure.length){
      fs.mkdirSync(path + '/' + array[i].name);
      console.log(array[i].name);
      let res = recursiveFunction(buff, counter + 1, foldersStructure,
        path + '/' + array[i].name, filesStructure, modelName);
      if(res == 0)
        return 0;
    }
    else
    {
      for (let j = 0; j < array.length; j++) {
        await gdCRUD.downloadFile(array[j].id).then((downloadedData)=>{
          console.log(array[j].name);
          let filename;            
          if(filesStructure != undefined){
            let ext = splitFileName.getExtension(array[j].name);
            filename = filesStructure[ext] + '.' + ext;
          }
          else
            filename = array[j].name;
          fs.writeFileSync(path + '/' + filename, downloadedData);
          console.log('Resolved ' + modelName);
        });
      }
      return 0;
    }
  }
}

exports.downloadModel = function(){
  return new Promise(async(resolve, reject)=>{
    let filesMetadata = [], result = [];
    console.log(this.GDFolderName);
    await gdCRUD.listFiles(this.GDFolderName, true).then((data)=>{
      result = data;
    });

    if(this.foldersStructure != undefined)
    {
      let counter = 0;
      let path = this.localDirectory;
      recursiveFunction(result, counter, this.foldersStructure,
         path, this.filesStructure, this.modelName);
    }
    
    // for (let i = 0; i < filesMetadata.length; i++) {
    //   await gdCRUD.listFiles(filesMetadata[i].id, false).then((files)=>{
    //     result.push({
    //       files : files
    //     });
    //   });
    //   if(this.filesStructure != undefined){
    //     let numberOfFiles = Array.from(new Set(Object.values(this.filesStructure))).length;
    //     if(result[i].files.length != numberOfFiles){
    //       console.log('ERROR! While downloading model!  ' + this.modelName +
    //       ` contains damaged object! Object '` + filesMetadata[i].name + `' is damaged`);
    //       Array.from(result[i]).pop();
    //       continue;
    //     }
    //   }
    //   let pathToFile = this.localDirectory + filesMetadata[i].name;
    //   result[i].pathToFile = pathToFile;
    //   fs.mkdirSync(pathToFile);
    //   for (let j = 0; j < result[i].files.length; j++) {
    //     await gdCRUD.downloadFile(result[i].files[j].id).then((downloadedData)=>{
    //       let filename;
    //       if(this.filesStructure != undefined){
    //         let ext = splitFileName.getExtension(result[i].files[j].name);
    //         filename = this.filesStructure[ext] + '.' + ext;
    //       }
    //       else
    //         filename = result[i].files[j].name;
    //       fs.writeFileSync(result[i].pathToFile + '/' + filename, downloadedData);
    //       console.log('Resolved ' + this.modelName);
    //     });
    //   }
    // }
    resolve(1);
  });
}