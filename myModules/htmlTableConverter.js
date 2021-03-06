const fs = require('fs');

exports.tableToArray = function(htmlTable, pathToSave){
//export function tableToArray(htmlTable) {
    let res = {};
    res.content = new Array();
    let start = htmlTable.indexOf('<caption>');
    if(start != -1)
    {
        let end = htmlTable.indexOf('</caption>');
        res.tableName = htmlTable.substr(start + 9, end - start - 9);
    }
    while (htmlTable.indexOf('<tr>') != -1) {
        while (htmlTable.indexOf('<th>') != -1) {
            let start = htmlTable.indexOf('<th>');
            let end = htmlTable.indexOf('</th>');
            if(res.headers == undefined)
                res.headers = [];
            res.headers.push(htmlTable.substr(start + 4, end - start - 4));
            htmlTable = removeRangeFromString(htmlTable, start, end + 5);
        }
        res.content.push(new Array());
        while (htmlTable.indexOf('<td>') != -1 && htmlTable.indexOf('<td>') < htmlTable.indexOf('</tr>')) {
            let start = htmlTable.indexOf('<td>');
            let end = htmlTable.indexOf('</td>');
            res.content[res.content.length - 1].push(htmlTable.substr(start + 4, end - start - 4));
            htmlTable = removeRangeFromString(htmlTable, start, end + 5);
        }
        htmlTable = removeRangeFromString(htmlTable, htmlTable.indexOf('<tr>'), htmlTable.indexOf('</tr>') + 5);
    }
    if(pathToSave != undefined)
        fs.writeFileSync(pathToSave, JSON.stringify(res));
    return res;
}

function removeRangeFromString(string, start, end)
{
    let temp = string.split('');
    temp.splice(start, end - start);
    return temp.join('');
}

function getValue(stringObject) {
    let start = stringObject.content.indexOf('<td>');
    let end = stringObject.content.indexOf('</td>');
    let value = stringObject.content.substr(start + 4, end - start - 4);
    stringObject.content = removeRangeFromString(stringObject.content, start, end + 5);
    return value;
}

exports.tableToDictionary = function(htmlTable, pathToSave){
//export function tableToDictionary(htmlTable) {
    let res = {};
    res.content = {};
    let htmlTableObject = {};
    htmlTableObject.content = htmlTable;
    while (htmlTableObject.content.indexOf('<tr>') != -1) {
        let key = getValue(htmlTableObject);
        let value = getValue(htmlTableObject);
        res.content[key] = value;
        let start = htmlTableObject.content.indexOf('<tr>');
        let end = htmlTableObject.content.indexOf('</tr>');
        htmlTableObject.content = removeRangeFromString(htmlTableObject.content, start, end + 5)
    }
    if(pathToSave != undefined)
        fs.writeFileSync(pathToSave, JSON.stringify(res.content));
    return res;
}