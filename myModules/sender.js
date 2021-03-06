var path = require('path');
const fs = require('fs');

exports.sendPage = function(response, page){
//export function sendPage(response, page) {
    response.sendFile(path.resolve('.') + '/public/pages/' + page + '.html');
};

exports.sendFile = function(req, res, page){
//export function sendFile(req, res, page) {
    let dataPath = path.resolve('.') + '/' + page + '/';
    let files = fs.readdirSync(dataPath);
    let group = req.body.group;
    if(group != undefined)
    {
      let ind = files.findIndex(function (element, index, array) {
        return element.includes(group);
      });
      dataPath +=  files[ind];
      files = fs.readdirSync(dataPath);
    }
    let val = req.body.val;
    let ind = files.findIndex(function (element, index, array) {
      return element.includes(val);
    });
    res.setHeader('Filename', encodeURI(files[ind]));
    res.sendFile(dataPath + '/' + files[ind]);
};