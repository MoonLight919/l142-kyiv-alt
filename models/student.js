let fs = require('fs');
let pathHelper = require('../myModules/pathHelper');
let gdCRUD = require('../googleDriveApi/googleDriveCRUD');

exports.Student = class {
  constructor() {
    this.GDFolderName = 'data_students',
    this.localDirectory = pathHelper.data_studentsDirectory,
    this.uploadable = false
  }
  downloadData(){
    gdCRUD.listFiles((err, res)=>{
      let folders = res.data.files;
      folders.forEach((folder)=>{
        gdCRUD.listFiles((err, res)=>{
          let files = res.data.files;
          let pathToFolder = this.localDirectory + folder.name;
          fs.mkdirSync(pathToFolder);
          files.forEach((file)=>{
            gdCRUD.downloadFile(file.id).then(function (downloadedData) {
                let ext = file.name.split('.')[1];
                let filename = ext == 'txt' ? 'description' : 'image';
                fs.writeFileSync(pathToFolder + '/' + filename + '.' + ext, downloadedData);
            });
          })
        }, undefined, folder.id)
      })
    }, this.GDFolderName);
  }
}