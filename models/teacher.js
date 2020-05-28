let fs = require('fs');
let pathHelper = require('../myModules/pathHelper');
let gdCRUD = require('../googleDriveApi/googleDriveCRUD');
let splitFileName = require('../myModules/splitFileName');

exports.Teacher = class {
  constructor() {
    this.GDFolderName = 'data_teachers',
    this.localDirectory = pathHelper.data_teachersDirectory,
    this.uploadable = false
  }
  downloadDataV2(){
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
                        let ext = splitFileName(file.name);
                        let filename = ext == 'txt' ? 'description' : 'image';
                        fs.writeFileSync(pathToTeacher + '/' + filename + '.' + ext, downloadedData);
                        console.log('Resolved teacher');
                    });
                  }))
                }
                else
                  return 1;
              })
            }))
          }
          else
            return 1;
        })
      } ))
    }).then(()=>{
      resolve(1);
    });;
  })
  }
  downloadData(){
    global.allTeachersLoaded = false;
    return new Promise(async(resolve, reject)=>{
      let departments = [], result = [];
      await gdCRUD.listFiles(this.GDFolderName, true).then((deps)=>{
        departments = deps;
      });
      for (let i = 0; i < departments.length; i++) {
        await gdCRUD.listFiles(departments[i].id, false).then((teachers)=>{
          result.push({
            department : departments[i],
            teachers: teachers
          });
        });
        if(result[i].teachers.length == 0)
          continue;
        let pathToDepartment = this.localDirectory + departments[i].name;
        result[i].pathToDepartment = pathToDepartment;
        fs.mkdirSync(pathToDepartment);
        for (let j = 0; j < result[i].teachers.length; j++) {
          await gdCRUD.listFiles(result[i].teachers[j].id, false).then((files)=>{
            result[i].teachers[j].files = files;
          });
          if(result[i].teachers[j].files.length != 2)
            continue;
          let pathToTeacher = result[i].pathToDepartment + '/' + result[i].teachers[j].name;
          fs.mkdirSync(pathToTeacher);
          result[i].teachers[j].pathToTeacher = pathToTeacher;
          for (let k = 0; k < result[i].teachers[j].files.length; k++) {
            await gdCRUD.downloadFile(result[i].teachers[j].files[k].id).then((downloadedData)=>{
              let ext = splitFileName.getExtension(result[i].teachers[j].files[k].name);
              let filename = ext == 'txt' ? 'description' : 'image';
              fs.writeFileSync(result[i].teachers[j].pathToTeacher + '/' + filename + '.' + ext, downloadedData);
              console.log('Resolved teacher');
            });
          }
        }
      }
      resolve(1);
      global.allTeachersLoaded = true;
    });
  }
  canBeDownloaded(){
    global.allTeachersLoaded = true;
  }
}