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
router.get('/information', function(req, res, next) {
  sender.sendPage(res, 'information');
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
router.get('/uploadableContent', function(req, res, next) {
  let contentParts = [];
  fs.readdirSync(pathHelper.uploadableContent).forEach(element => {
    contentParts.push(fs.readFileSync(pathHelper.uploadableContent + element));
  });
  res.send(contentParts.join(''));
});
router.post('/financeReports', jsonParser, function(req, res, next) {
  sender.sendFile(req, res, 'data_financeReports');
});
router.get('/financeReports/all', jsonParser, function(req, res, next) {
  let result = {
    content: new Array(),
    allLoaded: global.allFinanceReportsLoaded
  };
  if(fs.existsSync(pathHelper.data_financeReports)){
    fs.readdirSync(pathHelper.data_financeReports).forEach(folder => {
      let files =  fs.readdirSync(pathHelper.data_financeReports + '/' + folder);
      let reports = [];
      files.forEach((file)=>{
        reports.push(file);
      });
      result.content.push({
        name: folder,
        reports: reports
      });
    });
    res.send(result);
  }
});
router.post('/entranceExam', jsonParser, function(req, res, next) {
  sender.sendFile(req, res, 'entranceExam');
});
router.post('/index', jsonParser, function(req, res, next) {
  let result = {
    content: new Array(),
    allStudentsLoaded: global.allStudentsLoaded
  };
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
      result.content.push({
        name : folder,
        description : descriptionFile,
        imageSrc : imageSrc
      })
    })
    res.send(result);
  }
});

module.exports = router;
