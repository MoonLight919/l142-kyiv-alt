let downloadModel = require('../myModules/downloadModel');
let formats = require('../myModules/formats');
let pathHelper = require('../myModules/pathHelper');

exports.Student = class {
  constructor() {
    this.GDFolderName = 'data_students',
    this.localDirectory = pathHelper.data_studentsDirectory,
    this.uploadable = false,
    this.filesStructure = [];
    this.filesStructure["txt"] = 'description';
    for (let index = 0; index < formats.imageFormats.length; index++) {
      this.filesStructure[formats.imageFormats[index]] = 'image';
    }
    this.modelName = 'Student'
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