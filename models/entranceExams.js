let downloadModel = require('../myModules/downloadModel');
let pathHelper = require('../myModules/pathHelper');

exports.EntranceExams = class {
  constructor() {
    this.GDFolderName = 'data_entranceExam',
    this.localDirectory = pathHelper.data_entranceExam,
    this.uploadable = false
    this.filesStructure = undefined;
  }

  downloadData(){
    global.allEntranceExamsLoaded = false;
    return downloadModel.downloadModel(this.GDFolderName, 
      this.localDirectory, this.filesStructure, 'Entrance Exam');
  }
  canBeDownloaded(){
    global.allentranceExamsLoaded = true;
  }
}