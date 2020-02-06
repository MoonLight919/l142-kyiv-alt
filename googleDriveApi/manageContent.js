let fs = require('fs');
let gdCRUD = require('../googleDriveApi/googleDriveCRUD');
let authorization = require('../googleDriveApi/authorization');
let News = require('../models/news');
let Teacher = require('../models/teacher');
let Student = require('../models/student');
let EntranceExams = require('../models/entranceExams');
let FinanceReports = require('../models/financeReports');

let models = [];
models.push(new Student.Student());
models.push(new Teacher.Teacher());
models.push(new News.News());
models.push(new FinanceReports.FinanceReports());
models.push(new EntranceExams.EntranceExams());

exports.manageContent = async function() {
  for (let i = 0; i < models.length; i++){
    if(global.drive == undefined){
      await authorization.readCredentialsAndAuthorize().then(async function () {
        if(models[i].uploadable){
          console.log('uploadable');
          gdCRUD.listFiles(models[i].GDFolderName, true).then(processIncomingData);
        }
        if(!fs.existsSync(models[i].localDirectory))
        {
          fs.mkdirSync(models[i].localDirectory);
          await models[i].downloadData();
        }
        else
          models[i].canBeDownloaded();
      });
    }
    else
    {
      if(models[i].uploadable){
        console.log('uploadable');
        gdCRUD.listFiles(models[i].GDFolderName, true).then(processIncomingData);
      }
      if(!fs.existsSync(models[i].localDirectory))
      {
        fs.mkdirSync(models[i].localDirectory);
        await models[i].downloadData();
      }
      else
          models[i].canBeDownloaded();
    }
    console.log('model resolved');
  }
  console.log('Done management');
}

async function manageContentHandler() {
  if(models[i].uploadable)
    gdCRUD.listFiles(models[i].GDFolderName, true, processIncomingData);
  if(!fs.existsSync(models[i].localDirectory))
  {
    fs.mkdirSync(models[i].localDirectory);
    await models[i].downloadData();
  }
}

// In a case if you download data for further serving
// with db and uploading to Google Drive
async function processIncomingData(files){
  // console.log('CHECKING...');
  
  // if (err) return console.log('The API returned an error: ' + err);
  // let files = res.data.files;
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
      // }
      // else
      // {
      //   model.processFile(files[j]);
      // }
      console.log(`${files[j].name} (${files[j].id})`);
      
    }
  }
  else {
    console.log('No files found.');
  }
}
