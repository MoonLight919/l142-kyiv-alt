var express = require('express');
var sender = require('../myModules/sender');
var pathHelper = require('../myModules/pathHelper');
const fs = require('fs');
let imageDataURI = require('image-data-uri');
let iconv = require('iconv-lite');
let converter = require('../myModules/monthConverter');
var db = require('../myModules/db');

var router = express.Router();
const bodyParser = require('body-parser');

// Create application/json parser
var jsonParser = bodyParser.json();

router.get('/', function(req, res, next) {
  sender.sendPage(res, 'index');
});
router.get('/teachers', function(req, res, next) {
  sender.sendPage(res, 'teachers');
});
router.get('/entranceExam', function(req, res, next) {
  sender.sendPage(res, 'entranceExam');
});
router.get('/financeReports', function(req, res, next) {
  sender.sendPage(res, 'financeReports');
});
router.get('/contacts', function(req, res, next) {
  sender.sendPage(res, 'contacts');
});
router.get('/news', function(req, res, next) {
  sender.sendPage(res, 'news');
});
router.get('/news/:index', function(req, res, next) {
  let newsObject = db.getNewsByIndex(req.params.index).then(function(dbRes) {
    const keyValue = {
      'folderId' : 0
    }
    res.sendFile(pathHelper.data_newsDirectory + dbRes[keyValue['folderId']] + '/' + 'content.html');
  });
});
router.get('/uploadableContent', function(req, res, next) {
  let contentParts = [];
  fs.readdirSync(pathHelper.uploadableContent).forEach(element => {
    contentParts.push(fs.readFileSync(pathHelper.uploadableContent + element));
  });
  res.send(contentParts.join(''));
});
router.post('/financeReports', jsonParser, function(req, res, next) {
  sender.sendFile(req, res, 'financeReports');
});
router.post('/entranceExam', jsonParser, function(req, res, next) {
  sender.sendFile(req, res, 'entranceExam');
});
router.post('/index', jsonParser, function(req, res, next) {
  let result = [];
  if(fs.existsSync(pathHelper.data_studentsDirectory)){
    fs.readdirSync(pathHelper.data_studentsDirectory).forEach(folder => {
      let files =  fs.readdirSync(pathHelper.data_studentsDirectory + '/' + folder);
      let descriptionFile, imageSrc;
      files.forEach((file)=>{
        if(file.includes('description')){
          let descriptionData = fs.readFileSync(pathHelper.data_studentsDirectory +
             '/' + folder + '/' + file);
          descriptionFile = iconv.encode(iconv.decode(descriptionData, "cp1251"), "utf8").toString();  
        }
        else{
          let imageExt = file.split('.')[1];
          let image_buffer = fs.readFileSync(pathHelper.data_studentsDirectory +
            '/' + folder + '/' + file);
          imageSrc = imageDataURI.encode(image_buffer, imageExt);
        }
      });
      result.push({
        name : folder,
        description : descriptionFile,
        imageSrc : imageSrc
      })
    })
    res.send(result);
  }
});
router.post('/teachers', jsonParser, function(req, res, next) {
  let result = [];
  if(fs.existsSync(pathHelper.data_teachersDirectory)){
    fs.readdirSync(pathHelper.data_teachersDirectory).forEach(department => {
      let teachers = [];
      fs.readdirSync(pathHelper.data_teachersDirectory + department).forEach((teacher)=>{
        let descriptionFile, imageSrc;
        fs.readdirSync(pathHelper.data_teachersDirectory + '/' +
         department + '/' + teacher).forEach((file)=>{
          if(file.includes('description')){
            let descriptionData = fs.readFileSync(pathHelper.data_teachersDirectory 
              + department + '/' + '/' + teacher + '/' + file);
            descriptionFile = iconv.encode(iconv.decode(descriptionData, "cp1251"), "utf8").toString();  
          }
          else{
            let imageExt = file.split('.')[1];
            let image_buffer = fs.readFileSync(pathHelper.data_teachersDirectory 
              + department + '/' + '/' + teacher + '/' + file);
            imageSrc = imageDataURI.encode(image_buffer, imageExt);
          }
        });
        teachers.push({
          name : teacher,
          description : descriptionFile,
          imageSrc : imageSrc
        });
      });
      result.push({
        name : department,
        teachers : teachers
      });
    });
    res.send(result);
  }
});
// router.post('/news', jsonParser, function(req, res, next) {
//   if(fs.existsSync(pathHelper.data_newsDirectory)){
//     const keyValue = {
//       'id' : 0,
//       'title' : 1,
//       'published' : 2,
//       'convertedContentId' : 3,
//       'contentId' : 4,
//       'imageFile' : 5,
//       'folderId' : 6
//     }
//     let result = [];
//     db.getManyNews(req.body.page, req.body.amount).then(function(dbRes) {
//       let image_buffer;
//       Array.from(dbRes).forEach(element => {
//         let imageExt = element[keyValue['imageFile']].split('.')[1];
//         image_buffer = fs.readFileSync(pathHelper.data_newsDirectory + element[keyValue['folderId']] + '/' + 'image.' + imageExt);
//         let dataUri = imageDataURI.encode(image_buffer, imageExt);
//         let date = element[keyValue['published']].toString().split(' ');
//         let resDate = date[2] + ' ' + converter.EngToUA(date[1]) + ' ' + date[3];
//         result.push({
//           id : element[keyValue['id']],
//           title : element[keyValue['title']],
//           published : resDate,
//           imageSrc : dataUri
//         });
//       });
//       res.send(result);
//     });
//   }
// });

module.exports = router;
