import {receiveFile} from './common.js';

$(function(){
    $('.exams').click(function (e) {
        receiveFile('entranceExam', e);
    });
});