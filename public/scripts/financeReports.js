import {receiveFile} from './common.js';;

$(function(){
    $('.list-item').click(function (e) {
        receiveFile('financeReports', e);
    });
});