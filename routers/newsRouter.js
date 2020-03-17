var express = require('express');
var pathHelper = require('../myModules/pathHelper');
let converter = require('../myModules/monthConverter');
const fs = require('fs');
let imageDataURI = require('image-data-uri');
var db = require('../myModules/db');
var sender = require('../myModules/sender');

var router = express.Router();
const bodyParser = require('body-parser');

// Create application/json parser
var jsonParser = bodyParser.json();

router.get('/', function(req, res, next) {
  sender.sendPage(res, 'news');
});

router.get('/:index', function(req, res, next) {
  let newsObject = db.getNewsByIndex(req.params.index).then(function(dbRes) {
    const keyValue = {
      'folderId' : 0
    }
    res.sendFile(pathHelper.data_newsDirectory + dbRes[keyValue['folderId']] + '/' + 'content.html');
  });
});

router.post('/', jsonParser, function(req, res, next) {
  if(fs.existsSync(pathHelper.data_newsDirectory)){
    const keyValue = {
      'id' : 0,
      'title' : 1,
      'published' : 2,
      'convertedContentId' : 3,
      'contentId' : 4,
      'imageFile' : 5,
      'folderId' : 6
    }
    console.log('All news loaded: ' + global.allNewsLoaded);
    
    let result = {
      content: new Array(),
      allNewsLoaded: global.allNewsLoaded
    };
    if(global.allNewsLoaded == false)
      res.send(result);
    else
    {
      db.getManyNews(req.body.page, req.body.amount).then(function(dbRes) {
        let image_buffer;
        Array.from(dbRes).forEach(element => {
          let imageExt = element[keyValue['imageFile']].split('.')[1];
          image_buffer = fs.readFileSync(pathHelper.data_newsDirectory + element[keyValue['folderId']] + '/' + 'image.' + imageExt);
          let dataUri = imageDataURI.encode(image_buffer, imageExt);
          let date = element[keyValue['published']].toString().split(' ');
          let resDate = date[2] + ' ' + converter.EngToUA(date[1]) + ' ' + date[3];
          result.content.push({
            id : element[keyValue['id']],
            title : element[keyValue['title']],
            published : resDate,
            imageSrc : dataUri
          });
        });
        db.getAmountOfNews().then(function(count) {
          result.haveMoreNews = (req.body.page * req.body.amount) < count;
          res.send(result);
        })
      });
    }
  }
});


module.exports = router;
