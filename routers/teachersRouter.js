var express = require('express');
var pathHelper = require('../myModules/pathHelper');
const fs = require('fs');
let imageDataURI = require('image-data-uri');
let iconv = require('iconv-lite');
var sender = require('../myModules/sender');
let splitFileName = require('../myModules/splitFileName');

var router = express.Router();
const bodyParser = require('body-parser');

// Create application/json parser
var jsonParser = bodyParser.json();

router.get('/', function(req, res, next) {
  sender.sendPage(res, 'teachers');
});
router.post('/', jsonParser, function(req, res, next) {
  console.log(global.allTeachersLoaded);
  
  let result = {
    content: new Array(),
    allTeachersLoaded: global.allTeachersLoaded
  };
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
            let imageExt = splitFileName.getExtension(file);
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
      result.content.push({
        name : department,
        teachers : teachers
      });
    });
    res.send(result);
  }
});


module.exports = router;
