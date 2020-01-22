let fs = require('fs');
let pathHelper = require('../myModules/pathHelper');
let gdCRUD = require('../googleDriveApi/googleDriveCRUD');

exports.Student = class {
  constructor() {
    this.GDFolderName = 'data_students',
    this.localDirectory = pathHelper.data_studentsDirectory,
    this.uploadable = false
  }

  downloadDataV2(){
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

  downloadData(){
    global.allStudentsLoaded = false;
    return new Promise(async(resolve, reject)=>{
      let students = [], result = [];
      await gdCRUD.listFiles(this.GDFolderName, true).then((s)=>{
        students = s;
      });
      for (let i = 0; i < students.length; i++) {
        await gdCRUD.listFiles(students[i].id, false).then((files)=>{
          result.push({
            student : students[i],
            files: files
          });
        });
        if(result[i].files.length != 2)
          continue;
        let pathToStudents = this.localDirectory + students[i].name;
        result[i].pathToStudent = pathToStudents;
        fs.mkdirSync(pathToStudents);
        for (let j = 0; j < result[i].files.length; j++) {
          await gdCRUD.downloadFile(result[i].files[j].id).then((downloadedData)=>{
            let ext = result[i].files[j].name.split('.')[1];
            let filename = ext == 'txt' ? 'description' : 'image';
            fs.writeFileSync(result[i].pathToStudent + '/' + filename + '.' + ext, downloadedData);
            console.log('Resolved student');
          });
        }
      }
      resolve(1);
      global.allStudentsLoaded = true;
    });
  }
  canBeDownloaded(){
    global.allStudentsLoaded = true;
  }
}