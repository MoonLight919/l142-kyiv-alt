var path = require('path');
var pathHelper = require('./pathHelper');
const fs = require('fs');

exports.sendPage = function(response, page) {
    response.sendFile(path.resolve('.') + '/public/pages/' + page + '.html');
};
exports.sendFile = function sendFile(req, res, page) {
    let dataPath = pathHelper.dataDirectory + page;
    let files = fs.readdirSync(dataPath);
    let val = req.body.val;
    
    let ind = files.findIndex(function (element, index, array) {
      return element.includes(val);
    });
    
    res.setHeader('Filename', encodeURI(files[ind]));
    res.sendFile(dataPath + '/' + files[ind]);
};