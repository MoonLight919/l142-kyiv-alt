let schedule = require('node-schedule');
let fs = require('fs');
let gdCRUD = require('../googleDriveApi/googleDriveCRUD');
let db = require('../myModules/db');
let pathHelper = require('../myModules/pathHelper');
let authorization = require('../googleDriveApi/authorization');
let News = require('../models/news');

//export function startSchedule(timeString) {
exports.startSchedule = function(timeString) {
  var job = schedule.scheduleJob(timeString, async function(){
    let model = new News.News();
    if(global.drive == undefined){
      authorization.readCredentialsAndAuthorize().then(function () {
        gdCRUD.listFiles(processIncomingData, model.GDFolderName);
      });
    }
    else
      gdCRUD.listFiles(processIncomingData, model.GDFolderName);
    if(fs.readdirSync(pathHelper.dataDirectory).length == 1)
    {
      const keyValue = {
        'folderId' : 0,
        'convertedContentId' : 1,
        'imageFile' : 2
      }
      db.getAllNewsFolders().then((dbRes)=>{
        console.log(dbRes.length + ' news arrived');
        dbRes.forEach(element => {
          let pathToFolder = pathHelper.dataDirectory + element[keyValue['folderId']];
          fs.mkdirSync(pathToFolder);
          let imageParts = element[keyValue['imageFile']].split('.');
          let imageName = 'image.' + imageParts[1];
          let imageId = imageParts[0];
          let contentParts = element[keyValue['convertedContentId']].split('.');
          let contentId = contentParts[0];
          gdCRUD.downloadFile(imageId, imageName).then(function (downloadedData) {
            fs.writeFileSync(pathToFolder + '/' + imageName, downloadedData);
          });
          gdCRUD.downloadFile(contentId, 'content.html').then(function (downloadedData) {
            fs.writeFileSync(pathToFolder + '/content.html', downloadedData);
          });
          console.log('News saved');
        });
      });
    }
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
        gdCRUD.downloadFile(files[j].id, files[j].name, deleteFunction).then(function (downloadedData) {
          model.process(files[j], downloadedData);
        });
      // }
      // else
      // {
      //   model.process(files[j]);
      // }
      console.log(`${files[j].name} (${files[j].id})`);
      
    }
  }
  else {
    console.log('No files found.');
  }
}
