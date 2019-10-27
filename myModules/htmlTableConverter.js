exports.tableToArray = function(htmlTable){
//export function tableToArray(htmlTable) {
    let res = {};
    let start = htmlTable.indexOf('<caption>');
    if(start != -1)
    {
        let end = htmlTable.indexOf('</caption>');
        res.tableName = htmlTable.substr(start + 9, end - start - 9);
    }
    while (htmlTable.indexOf('<tr>') != -1) {
        console.log(htmlTable);
        while (htmlTable.indexOf('<th>') != -1) {
            let start = htmlTable.indexOf('<th>');
            let end = htmlTable.indexOf('</th>');
            if(res.headers == undefined)
                res.headers = [];
            res.headers.push(htmlTable.substr(start + 4, end - start - 4));
            htmlTable = removeRangeFromString(htmlTable, start, end + 5);
        }
        htmlTable = removeRangeFromString(htmlTable, htmlTable.indexOf('<tr>'), htmlTable.indexOf('</tr>') + 5);
        if(res.content == undefined)
            res.content = new Array();
        res.content.push(new Array());
        while (htmlTable.indexOf('<td>') != -1 && htmlTable.indexOf('<td>') < htmlTable.indexOf('</tr>')) {
            let start = htmlTable.indexOf('<td>');
            let end = htmlTable.indexOf('</td>');
            //console.log(htmlTable.substr(start + 4, end - start - 4));
            res.content[res.content.length - 1].push(htmlTable.substr(start + 4, end - start - 4));
            htmlTable = removeRangeFromString(htmlTable, start, end + 5);
        }
        //htmlTable = removeRangeFromString(htmlTable, htmlTable.indexOf('<tr>'), htmlTable.indexOf('</tr>') + 5);
    }
    return res;
}

function removeRangeFromString(string, start, end)
{
    let temp = string.split('');
    temp.splice(start, end - start);
    return temp.join('');
}

exports.tableToDictionary = function(htmlTable){
//export function tableToDictionary(htmlTable) {

}

exports.arrayToTable = function(htmlTable){
//export function arrayToTable(htmlTable) {

}

exports.dictionaryToTable = function(htmlTable){
//export function dictionaryToTable(htmlTable) {

}