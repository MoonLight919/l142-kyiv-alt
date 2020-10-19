let downloadModel = require('../myModules/downloadModel');
let pathHelper = require('../myModules/pathHelper');

exports.FinanceReports = class {
  constructor() {
    this.GDFolderName = 'data_financeReports',
    this.localDirectory = pathHelper.data_financeReports,
    this.uploadable = false,
    this.modelName = 'Finance Report',
    this.foldersStructure = ["Periods"]
  }

  downloadData(){
    global.allFinanceReportsLoaded = false;
    let downloadModelFunction = downloadModel.downloadModel.bind(this);
    return downloadModelFunction();
  }
  canBeDownloaded(){
    global.allFinanceReportsLoaded = true;
  }
}