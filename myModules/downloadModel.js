let fs = require('fs');
let gdCRUD = require('../googleDriveApi/googleDriveCRUD');
let splitFileName = require('./splitFileName');

async function recursiveFunction(array, counter, foldersStructure
  , path, filesStructure, modelName) {
  return new Promise(async(resolve, reject)=>{
    console.log(counter);
    let buff = [];
    for (let i = 0; i < array.length; i++){
      await gdCRUD.listFiles(array[i].id, false).then((files)=>{
        buff = files;
      });
      if(counter < foldersStructure.length){
        fs.mkdirSync(path + '/' + array[i].name);
        console.log(array[i].name);
        let res = await recursiveFunction(buff, counter + 1, foldersStructure,
          path + '/' + array[i].name, filesStructure, modelName);
        if(res == 0){
          resolve(1);
          return 0;
        }
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
            resolve(1);
          });
        }
        
        resolve(1);
        return 0;
      }
      resolve(1);
    }
    resolve(1);
  });
}

exports.downloadModel = function(){
  return new Promise(async(resolve, reject)=>{
    let result = [];
    console.log(this.GDFolderName);
    await gdCRUD.listFiles(this.GDFolderName, true).then((data)=>{
      result = data;
    });

    if(this.foldersStructure != undefined)
    {
      let counter = 0;
      let path = this.localDirectory;
      await recursiveFunction(result, counter, this.foldersStructure,
         path, this.filesStructure, this.modelName);
    }
    
    resolve(1);
  });
}