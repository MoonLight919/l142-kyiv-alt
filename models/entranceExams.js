let downloadModel = require('../myModules/downloadModel');
let pathHelper = require('../myModules/pathHelper');

exports.EntranceExams = class {
  constructor() {
    this.GDFolderName = 'data_entranceExam',
    this.localDirectory = pathHelper.data_entranceExam,
    this.uploadable = false,
    this.modelName = 'Entrance Exam'
  }

  downloadData(){
    global.allEntranceExamsLoaded = false;
    let downloadModelFunction = downloadModel.downloadModel.bind(this);
    return downloadModelFunction();
  }
  canBeDownloaded(){
    global.allentranceExamsLoaded = true;
  }
}