let fs = require('fs');
let pathHelper = require('../myModules/pathHelper');
let gdCRUD = require('../googleDriveApi/googleDriveCRUD');
let splitFileName = require('../myModules/splitFileName');
let downloadModel = require('../myModules/downloadModel');
let formats = require('../myModules/formats');

exports.Teacher = class {
  constructor() {
    this.GDFolderName = 'data_teachers';
    this.localDirectory = pathHelper.data_teachersDirectory;
    this.uploadable = false;
    this.foldersStructure = ["Departments", "Teachers"];
    this.modelName = 'Student';
    this.filesStructure = [];
    this.filesStructure["txt"] = 'description';
    for (let index = 0; index < formats.imageFormats.length; index++) {
      this.filesStructure[formats.imageFormats[index]] = 'image';
    }
  }

  downloadData()
  {
    global.allTeachersLoaded = false;
    let downloadModelFunction = downloadModel.downloadModel.bind(this);
    return downloadModelFunction();
  }
  canBeDownloaded(){
    global.allTeachersLoaded = true;
  }
}