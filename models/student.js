let downloadModel = require('../myModules/downloadModel');
let formats = require('../myModules/formats');
let pathHelper = require('../myModules/pathHelper');

exports.Student = class {
  constructor() {
    this.GDFolderName = 'data_students',
    this.localDirectory = pathHelper.data_studentsDirectory,
    this.uploadable = false,
    // this.filesStructure = {
    //   "txt" : 'description'
    // }
    this.filesStructure = [];
    this.filesStructure["txt"] = 'description';
    for (let index = 0; index < formats.imageFormats.length; index++) {
      this.filesStructure[formats.imageFormats[index]] = 'image';
    }
  }

  downloadData(){
    global.allEntranceExamsLoaded = false;
    return downloadModel.downloadModel(this.GDFolderName, 
      this.localDirectory, this.filesStructure, 'Student');
  }

  canBeDownloaded(){
    global.allStudentsLoaded = true;
  }
}