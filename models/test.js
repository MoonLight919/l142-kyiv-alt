let downloadModel = require('../myModules/downloadModel');
let formats = require('../myModules/formats');
let pathHelper = require('../myModules/pathHelper');

exports.Test = class {
  constructor() {
    this.GDFolderName = 'test',
    this.localDirectory = pathHelper.test + '/',
    this.uploadable = false,
    this.foldersStructure = ["Companies", "Departments", "Groups"],
    this.modelName = 'Industry'
  }

  downloadData(){
    global.allEntranceExamsLoaded = false;
    let downloadModelFunction = downloadModel.downloadModel.bind(this);
    return downloadModelFunction();
  }

  canBeDownloaded(){
    global.allStudentsLoaded = true;
  }
}