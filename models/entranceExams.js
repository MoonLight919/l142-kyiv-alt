let fs = require('fs');
let pathHelper = require('../myModules/pathHelper');
let gdCRUD = require('../googleDriveApi/googleDriveCRUD');

exports.EntranceExams = class {
  constructor() {
    this.GDFolderName = 'entranceExams',
    this.localDirectory = pathHelper.data_entranceExam,
    this.uploadable = false
  }

  downloadData(){
    console.log('started');
    global.allEntranceExamsLoaded = false;
    return new Promise(async(resolve, reject)=>{
      let entranceExams = [], result = [];
      await gdCRUD.listFiles(this.GDFolderName, true).then((e)=>{
        entranceExams = e;
      });
      console.log(entranceExams.length);
      
      for (let i = 0; i < entranceExams.length; i++) {
        await gdCRUD.listFiles(entranceExams[i].id, false).then((files)=>{
          result.push({
            files: files
          });
        });
        let pathToentranceExams = this.localDirectory + entranceExams[i].name;
        result[i].pathToExam = pathToentranceExams;
        fs.mkdirSync(pathToentranceExams);
        for (let j = 0; j < result[i].files.length; j++) {
          await gdCRUD.downloadFile(result[i].files[j].id).then((downloadedData)=>{
            let filename = 'Ліцей №142 | Конкурсні випробування | ' + result[i].files[j].name;
            fs.writeFileSync(result[i].pathToExam + '/' + filename, downloadedData);
            console.log('Resolved entrance exam');
          });
        }
      }
      resolve(1);
      global.allEntranceExamsLoaded = true;
    });
  }
  canBeDownloaded(){
    global.allentranceExamsLoaded = true;
  }
}