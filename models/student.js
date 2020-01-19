let fs = require('fs');
let pathHelper = require('../myModules/pathHelper');
let gdCRUD = require('../googleDriveApi/googleDriveCRUD');

exports.Student = class {
  constructor() {
    this.GDFolderName = 'data_students',
    this.localDirectory = pathHelper.data_studentsDirectory,
    this.uploadable = false
  }

  // downloadData(){
  //   return new Promise((resolve, reject)=>{
  //   gdCRUD.listFiles(this.GDFolderName, true).then((downloadedData)=>{
  //     let folders = downloadedData;
  //     for (let i = 0; i < folders.length; i++){
  //       gdCRUD.listFiles(folders[i].id, false).then((downloadedData)=>{
  //         let files = downloadedData;
  //         let pathToFolder = this.localDirectory + folders[i].name;
  //         fs.mkdirSync(pathToFolder);
  //         for (let j = 0; j < files.length; j++){
  //           gdCRUD.downloadFile(files[j].id).then((downloadedData)=>{
  //               let ext = files[j].name.split('.')[1];
  //               let filename = ext == 'txt' ? 'description' : 'image';
  //               fs.writeFileSync(pathToFolder + '/' + filename + '.' + ext, downloadedData);
  //               console.log('i: ' + i);
  //               console.log('j: ' + j);
  //               if(fs.readdirSync(pathToFolder).length == 2 &&
  //                 i == folders.length - 1 && 
  //                 j == files.length - 1){
  //                 console.log('Resolved student');
  //                 resolve(1);
  //                 return 1;
  //               }
  //           });
  //         }
  //       })
  //     }
  //   });
  // });
  // }

  downloadData(){
    return new Promise((resolve, reject)=>{
      gdCRUD.listFiles(this.GDFolderName, true).then((folders)=>{
        return Promise.all(folders.map((folder) =>{
          let pathToFolder = this.localDirectory + folder.name;
          fs.mkdirSync(pathToFolder);
          return gdCRUD.listFiles(folder.id, false).then((files)=>{
            return Promise.all(files.map((file)=>{
              return gdCRUD.downloadFile(file.id).then((downloadedData)=>{
                let ext = file.name.split('.')[1];
                let filename = ext == 'txt' ? 'description' : 'image';
                fs.writeFileSync(pathToFolder + '/' + filename + '.' + ext, downloadedData);
                console.log('Resolved student');
            });
           }));
          });
        }));
      }).then(()=>{
        resolve(1);
      });
  })
  }
}