let fs = require('fs');
let pathHelper = require('../myModules/pathHelper');
let gdCRUD = require('../googleDriveApi/googleDriveCRUD');

exports.FinanceReports = class {
  constructor() {
    this.GDFolderName = 'data_financeReports',
    this.localDirectory = pathHelper.data_financeReports,
    this.uploadable = false
  }

  downloadData(){
    global.allFinanceReportsLoaded = false;
    return new Promise(async(resolve, reject)=>{
      let financeReports = [], result = [];
      await gdCRUD.listFiles(this.GDFolderName, true).then((r)=>{
        financeReports = r;
      });
      for (let i = 0; i < financeReports.length; i++) {
        await gdCRUD.listFiles(financeReports[i].id, false).then((files)=>{
          result.push({
            files: files
          });
        });
        let pathTofinanceReports = this.localDirectory + financeReports[i].name;
        result[i].pathToReport = pathTofinanceReports;
        fs.mkdirSync(pathTofinanceReports);
        for (let j = 0; j < result[i].files.length; j++) {
          await gdCRUD.downloadFile(result[i].files[j].id).then((downloadedData)=>{
            let filename = result[i].files[j].name;
            fs.writeFileSync(result[i].pathToReport + '/' + filename, downloadedData);
            console.log('Resolved finance report');
          });
        }
      }
      resolve(1);
      global.allFinanceReportsLoaded = true;
    });
  }
  canBeDownloaded(){
    global.allFinanceReportsLoaded = true;
  }
}