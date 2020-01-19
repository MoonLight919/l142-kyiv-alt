let fs = require('fs');
let pathHelper = require('../myModules/pathHelper');
let gdCRUD = require('../googleDriveApi/googleDriveCRUD');

exports.Teacher = class {
  constructor() {
    this.GDFolderName = 'data_teachers',
    this.localDirectory = pathHelper.data_teachersDirectory,
    this.uploadable = false
  }
  downloadData(){
    return new Promise((resolve, reject)=>{
    gdCRUD.listFiles(this.GDFolderName, true).then((departments)=>{
      return Promise.all(departments.map((department) =>{
        return gdCRUD.listFiles(department.id, false).then((teachers)=>{
          if(teachers.length > 0){
            let pathToDepartment = this.localDirectory + department.name;
            fs.mkdirSync(pathToDepartment);
            return Promise.all(teachers.map((teacher) =>{
              return gdCRUD.listFiles(teacher.id, false).then((files)=>{
                if(files.length == 2){
                  let pathToTeacher = pathToDepartment + '/' + teacher.name;
                  fs.mkdirSync(pathToTeacher);
                  return Promise.all(files.map((file) =>{
                    return gdCRUD.downloadFile(file.id).then(function (downloadedData) {
                        let ext = file.name.split('.')[1];
                        let filename = ext == 'txt' ? 'description' : 'image';
                        fs.writeFileSync(pathToTeacher + '/' + filename + '.' + ext, downloadedData);
                        console.log('Resolved teacher');
                    });
                  }))
                }
              })
            }))
          }
        })
      } ))
    }).then(()=>{
      resolve(1);
    });;
  })
  }
}