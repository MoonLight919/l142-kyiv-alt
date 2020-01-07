let schedule = require('node-schedule');
let fs = require('fs');
let gdCRUD = require('../googleDriveApi/googleDriveCRUD');
let authorization = require('../googleDriveApi/authorization');
let News = require('../models/news');
let Teacher = require('../models/teacher');
let Student = require('../models/student');

let models = [];
models.push(new News.News());
models.push(new Teacher.Teacher());
models.push(new Student.Student());

//export function startSchedule(timeString) {
exports.startSchedule = function(timeString) {
  var job = schedule.scheduleJob(timeString, async function(){
    authorization.readCredentialsAndAuthorize().then(function () {
      models.forEach((model)=>{
        if(model.uploadable)
          gdCRUD.listFiles(processIncomingData, model.GDFolderName);
        if(!fs.existsSync(model.localDirectory))
        {
          fs.mkdirSync(model.localDirectory);
          model.downloadData();
        }
      })
    })
  });
}

async function processIncomingData(err, res){
  if (err) return console.log('The API returned an error: ' + err);
  let files = res.data.files;
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
