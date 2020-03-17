var express = require('express');
var pathHelper = require('../myModules/pathHelper');
const fs = require('fs');
var sender = require('../myModules/sender');

var router = express.Router();
const bodyParser = require('body-parser');

// Create application/json parser
var jsonParser = bodyParser.json();

router.get('/', function(req, res, next) {
    sender.sendPage(res, 'financeReports');
});

router.post('/', jsonParser, function(req, res, next) {
    sender.sendFile(req, res, 'data_financeReports');
  });
router.get('/all', jsonParser, function(req, res, next) {
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

module.exports = router;
