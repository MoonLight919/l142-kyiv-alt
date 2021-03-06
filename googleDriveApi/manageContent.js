let fs = require('fs');
let gdCRUD = require('../googleDriveApi/googleDriveCRUD');
let authorization = require('../googleDriveApi/authorization');
let News = require('../models/news');
let Teacher = require('../models/teacher');
let Student = require('../models/student');
let EntranceExams = require('../models/entranceExams');
let FinanceReports = require('../models/financeReports');
let Test = require('../models/test');

let models = [];
models.push(new News.News());
models.push(new Student.Student());
models.push(new Teacher.Teacher());
models.push(new FinanceReports.FinanceReports());
models.push(new EntranceExams.EntranceExams());

exports.manageContent = async function() {
  for (let i = 0; i < models.length; i++){
    if(global.drive == undefined){
      let manageContentHandlerFunction = manageContentHandler.bind(null, models[i]);
      await authorization.readCredentialsAndAuthorize().then(manageContentHandlerFunction);
    }
    else
      await manageContentHandler(models[i]);
  }
}

async function manageContentHandler(model) {
  if(model.uploadable)
    gdCRUD.listFiles(model.GDFolderName, true).then(processIncomingData);
  if(!fs.existsSync(model.localDirectory))
  {
    fs.mkdirSync(model.localDirectory);
    await model.downloadData();
    console.log(model.modelName + ' done');
  }
  else
      model.canBeDownloaded();
}

// In a case if you download data for further serving
// with db and uploading to Google Drive
async function processIncomingData(files){
  let model = new News.News();
  if (files.length) {
    console.log('Files:');
    for (let j = 0; j < files.length; j++) {
      console.log(`Won't be deleted`);
      //if(model.toDownload(files[j].name)){
        let deleteFunction;
        if(model.toDelete(files[j].name))
          deleteFunction = gdCRUD.deleteFile.bind(null, files[j].id);
        else
          deleteFunction = () => {console.log(`Won't be deleted`);}
        gdCRUD.downloadFile(files[j].id, deleteFunction).then(function (downloadedData) {
          model.processFile(files[j], downloadedData);
        });
      console.log(`${files[j].name} (${files[j].id})`);
      
    }
  }
  else {
    console.log('No files found.');
  }
}
