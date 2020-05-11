// import * as express from 'express';
// import * as path from 'path';
// import * as cookieParser from 'cookie-parser';
// import * as bodyParser from 'body-parser';
// import * as logger from 'morgan';
// import * as schedule from './myModules/uploadNewContent';
// import * as db from './myModules/db';
// import * as https from 'https';
// import * as htmlTableConverter from './myModules/htmlTableConverter';
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var https = require('https');
var googleDriveApi = require('./googleDriveApi/manageContent');
var favicon = require('serve-favicon');

var app = express();
var mainRouter = require('./routers/mainRouter');
var financeReportsRouter = require('./routers/financeReportsRouter');
var indexRouter = require('./routers/indexRouter');
var newsRouter = require('./routers/newsRouter');
var teachersRouter = require('./routers/teachersRouter');
var db = require('./myModules/db');
let gdCRUD = require('./googleDriveApi/googleDriveCRUD');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname,'public','images','250px-Flag142.gif')));

app.use('/financeReports', financeReportsRouter);
app.use('/teachers', teachersRouter);
app.use('/news', newsRouter);
app.use('/', indexRouter);
app.use('/', mainRouter);

//db.createNewsTable();
//db.truncateTable('additional');
//db.createNewsRowsCount();
//console.log('done');

googleDriveApi.manageContent();
//db.getManyNews(0, 2);

// setInterval(function() {
//     https.get("https://l142-kyiv.herokuapp.com/");
// }, 300000); // every 5 minutes

module.exports = app;
