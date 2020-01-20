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
var googleDriveApi = require('./googleDriveApi/manageContent');

var app = express();
var mainRouter = require('./routers/mainRouter');
var newsRouter = require('./routers/newsRouter');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/news', newsRouter);
app.use('/', mainRouter);

//db.createNewsTable();
//db.truncateTable('additional');
//db.createNewsRowsCount();
//console.log('done');

googleDriveApi.manageContent();

// setInterval(function() {
//     https.get("https://l142-kyiv.herokuapp.com/");
// }, 300000); // every 5 minutes

module.exports = app;
