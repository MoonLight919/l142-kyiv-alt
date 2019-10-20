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
router.get('/news/:index', function(req, res, next) {
  let newsObject = db.getNewsByIndex(req.params.index).then(function(dbRes) {
    res.sendFile(pathHelper.dataDirectory + 'news_html/' + dbRes + '.html');
  });
});

router.post('/financeReports', jsonParser, function(req, res, next) {
  sender.sendFile(req, res, 'financeReports');
});
router.post('/entranceExam', jsonParser, function(req, res, next) {
  sender.sendFile(req, res, 'entranceExam');
});
router.post('/news', jsonParser, function(req, res, next) {
  let result = [];
  db.getManyNews(req.body.page, req.body.amount).then(function(dbRes) {
    let image_buffer;
    Array.from(dbRes).forEach(element => {
      let imageFile = element[4].trim();
      image_buffer = fs.readFileSync(pathHelper.dataDirectory + 'news_drive/' + imageFile);
      let dataUri = imageDataURI.encode(image_buffer, imageFile.split('.')[1]);
      let date = element[2].toString().split(' ');
      console.log(date[1]);
      let resDate = date[2] + ' ' + converter.EngToUA(date[1]) + ' ' + date[3];
      result.push({
        id : element[0],
        title : element[1],
        published : resDate,
        imageSrc : dataUri
      });
    });
    res.send(result);
  });
});


module.exports = router;
