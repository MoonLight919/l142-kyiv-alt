let downloadModel = require('../myModules/downloadModel');
let formats = require('../myModules/formats');
let pathHelper = require('../myModules/pathHelper');

exports.Student = class {
  constructor() {
    this.GDFolderName = 'data_students',
    this.localDirectory = pathHelper.data_studentsDirectory,
    this.uploadable = false,
    this.foldersStructure = ["Students"],
    this.filesStructure = [];
    this.filesStructure["txt"] = 'description';
    for (let index = 0; index < formats.imageFormats.length; index++) {
      this.filesStructure[formats.imageFormats[index]] = 'image';
    }
    this.modelName = 'Student'
  }

  downloadData(){
    return new Promise(async(resolve, reject)=>{
      global.allEntranceExamsLoaded = false;
      let downloadModelFunction = downloadModel.downloadModel.bind(this);
      await downloadModelFunction();
      console.log('1111111111111111111111111111111111111111111111111111');
      resolve(1);
    });
  }

  canBeDownloaded(){
    global.allStudentsLoaded = true;
  }
}