var express = require('express');
var pathHelper = require('../myModules/pathHelper');
const fs = require('fs');
let imageDataURI = require('image-data-uri');
var sender = require('../myModules/sender');
let iconv = require('iconv-lite');
let splitFileName = require('../myModules/splitFileName');

var router = express.Router();
const bodyParser = require('body-parser');

// Create application/json parser
var jsonParser = bodyParser.json();

router.get('/', function(req, res, next) {
  sender.sendPage(res, 'index');
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
            let imageExt = splitFileName.getExtension(file);
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
