let downloadModel = require('../myModules/downloadModel');
let pathHelper = require('../myModules/pathHelper');

exports.FinanceReports = class {
  constructor() {
    this.GDFolderName = 'data_financeReports',
    this.localDirectory = pathHelper.data_financeReports,
    this.uploadable = false,
    this.filesStructure = undefined
  }

  downloadData(){
    global.allFinanceReportsLoaded = false;
    return downloadModel.downloadModel(this.GDFolderName, 
      this.localDirectory, this.filesStructure, 'Finance Report');
  }
  canBeDownloaded(){
    global.allFinanceReportsLoaded = true;
  }
}