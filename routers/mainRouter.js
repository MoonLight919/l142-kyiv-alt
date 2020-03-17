var express = require('express');
var sender = require('../myModules/sender');
var pathHelper = require('../myModules/pathHelper');
const fs = require('fs');

var router = express.Router();
const bodyParser = require('body-parser');

// Create application/json parser
var jsonParser = bodyParser.json();

router.get('/favicon', function(req, res, next) {
  res.sendFile('../public/images/250px-Flag142.gif')
});
router.get('/information', function(req, res, next) {
  sender.sendPage(res, 'information');
});
router.get('/entranceExam', function(req, res, next) {
  sender.sendPage(res, 'entranceExam');
});
router.get('/contacts', function(req, res, next) {
  sender.sendPage(res, 'contacts');
});
router.get('/uploadableContent', function(req, res, next) {
  let contentParts = [];
  fs.readdirSync(pathHelper.uploadableContent).forEach(element => {
    contentParts.push(fs.readFileSync(pathHelper.uploadableContent + element));
  });
  res.send(contentParts.join(''));
});
router.post('/entranceExam', jsonParser, function(req, res, next) {
  sender.sendFile(req, res, 'data_entranceExam');
});

module.exports = router;
