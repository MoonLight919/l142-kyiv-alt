var express = require('express');
var sender = require('./myModules/sender');
var pathHelper = require('./myModules/pathHelper');
let converter = require('./myModules/monthConverter');
const fs = require('fs');
let imageDataURI = require('image-data-uri');
var db = require('./myModules/db');

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
router.get('/news', function(req, res, next) {
  sender.sendPage(res, 'news');
});
router.get('/uploadableContent', function(req, res, next) {
  fs.readdirsync(pathHelper.dataDirectory + 'uploadableContent').forEach(element => {
    
  });
});
router.get('/news/:index', function(req, res, next) {
  let newsObject = db.getNewsByIndex(req.params.index).then(function(dbRes) {
    const keyValue = {
      'folderId' : 0
    }
    res.sendFile(pathHelper.dataDirectory + dbRes[keyValue['folderId']] + '/' + 'content.html');
  });
});

router.post('/financeReports', jsonParser, function(req, res, next) {
  sender.sendFile(req, res, 'financeReports');
});
router.post('/entranceExam', jsonParser, function(req, res, next) {
  sender.sendFile(req, res, 'entranceExam');
});
router.post('/news', jsonParser, function(req, res, next) {
  if(fs.existsSync(pathHelper.dataDirectory)){
    const keyValue = {
      'id' : 0,
      'title' : 1,
      'published' : 2,
      'convertedContentId' : 3,
      'contentId' : 4,
      'imageFile' : 5,
      'folderId' : 6
    }
    let result = [];
    db.getManyNews(req.body.page, req.body.amount).then(function(dbRes) {
      let image_buffer;
      Array.from(dbRes).forEach(element => {
        let imageExt = element[keyValue['imageFile']].split('.')[1];
        image_buffer = fs.readFileSync(pathHelper.dataDirectory + element[keyValue['folderId']] + '/' + 'image.' + imageExt);
        let dataUri = imageDataURI.encode(image_buffer, imageExt);
        let date = element[keyValue['published']].toString().split(' ');
        console.log(date[1]);
        let resDate = date[2] + ' ' + converter.EngToUA(date[1]) + ' ' + date[3];
        result.push({
          id : element[keyValue['id']],
          title : element[keyValue['title']],
          published : resDate,
          imageSrc : dataUri
        });
      });
      res.send(result);
    });
  }
});


module.exports = router;
