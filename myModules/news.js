// import * as fs from 'fs'
// import * as readline from 'readline'
// import {google} from 'googleapis'
// import * as schedule from 'node-schedule'
// import * as db from './db'
// import * as iconv from 'iconv-lite'
// import * as streamBuffers from 'stream-buffers'
// import * as htmlTableConverter from './newsConverterAvailableFormats'
let readline = require('readline');
let {google} = require('googleapis');
let schedule = require('node-schedule');
let db = require('./db');
let iconv = require('iconv-lite');
let streamBuffers = require('stream-buffers');
let htmlTableConverter = require('./newsConverterAvailableFormats');

function cloudconvertOptions(parts) {
  return {
    "inputformat": parts[1],
    "outputformat": "html",
    "input": "upload",
    "converteroptions": {
      "page_range": null,
      "outline": null,
      "zoom": 1.3,
      "page_width": null,
      "page_height": null,
      "embed_css": true,
      "embed_javascript": true,
      "embed_image": true,
      "embed_font": true,
      "split_pages": false,
      "space_as_offset": false,
      "simple_html": null,
      "bg_format": "png",
      "input_password": null,
      "templating": null
    }
  };
}

// If modifying these scopes, delete token.json.
const SCOPES = [
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive'
];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

//export function startSchedule(timeString) {
exports.startSchedule = function(timeString) {
  var job = schedule.scheduleJob(timeString, async function(){
    if(global.drive == undefined){
      readCredentialsAndAuthorize().then(listFiles);
    }
    else
      listFiles();
  });
}

//export async function sendToConverter(filename, downloadedData) {
exports.sendToConverter = async function(filename, downloadedData) {
  cloudconvert = new (require('cloudconvert'))('sJo6q3UWyqWZP40py0HhLt1EFuToyZuMPzdG5oMs0fLXwlUjehaq9xtsMyX1G3NJ');
  let parts = filename.split('.');
  let bufs = [], resData;
  var myReadableStreamBuffer = new streamBuffers.ReadableStreamBuffer({
    frequency: 10,      // in milliseconds.
    chunkSize: 2048     // in bytes.
  }); 
  myReadableStreamBuffer.put(aBuffer);
  await myReadableStreamBuffer.pipe(cloudconvert.convert(cloudconvertOptions(parts))).on('data', function(data){
    bufs.push(data); 
  })
  .on('end', function(){
    resData = Buffer.concat(bufs);
  });
  return resData;
}

function readCredentialsAndAuthorize() {
  console.log('reading credentials...');
  
  // Load client secrets from a local file.
    let credentials = fs.readFileSync('credentials.json');

    // Authorize a client with credentials, then call the Google Drive API.
    //return new Promise(function(resolve, reject){
    return authorize(JSON.parse(credentials), (auth) => {
        global.drive = google.drive({version: 'v3', auth});
        console.log('Drive created!');
      });
      //resolve('Drive created!');
  //})
}

/**
* Create an OAuth2 client with the given credentials, and then execute the
* given callback function.
* @param {Object} credentials The authorization client credentials.
* @param {function} callback The callback to call with the authorized client.
*/
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

  // Check if we have previously stored a token.
  return new Promise(function(resolve, reject){
    fs.readFile(TOKEN_PATH, async function(err, token){
      if (err)
        return getAccessToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      await callback(oAuth2Client);
      console.log('done authorize');
      resolve('done authorize');
    });
  });
}

/**
* Get and store new token after prompting for user authorization, and then
* execute the given callback with the authorized OAuth2 client.
* @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
* @param {getEventsCallback} callback The callback for the authorized client.
*/
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
* Lists the names and IDs of up to 10 files.
* @param {google.auth.OAuth2} auth An authorized OAuth2 client.
*/
function listFiles() {
  let googleDriveCredentials = JSON.parse(fs.readFileSync('googleDriveCredentials.json'));
  let keys = ['news_incomes'];
  let processingHandlers = [processNews];
  let dbSendHandlers = [sendToDb];
  for (let i = 0; i < keys.length; i++) {
    global.drive.files.list({
      q: `'${googleDriveCredentials.folders[keys[i]]}' in parents`,
      pageSize: 10,
      fields: 'nextPageToken, files(id, name)',
    }, async function(err, res){
      if (err) return console.log('The API returned an error: ' + err);
      let files = res.data.files;
      let dataForDb = [];
      if (files.length) {
        console.log('Files:');
        for (let j = 0; j < files.length; j++) {
          let deleteFunction = deleteFile.bind(null, files[j].id);
          console.log(`${files[j].name} (${files[j].id})`);
          let downloadedData;
          if(!newsConverterAvailableFormats.isImage(filename.split('.')[1]))
            downloadedData = await downloadFile(files[j].id, files[j].name, deleteFunction);
          processingHandlers[i](files[j], dataForDb, downloadedData);
        }
        dbSendHandlers[i](dataForDb);
      } else {
        console.log('No files found.');
      }
    });
  }
}

function processNews(file, dataForDb, downloadedData) {
  let parts = file.name.split('.');
  if(newsConverterAvailableFormats.isDocument(parts[1])){
    dataForDb["contentName"] = file.id;
    dataForDb["dataBuffer"] = sendToConverter(file.name, downloadedData)
    console.log('Content recieved');
  }
  else if(newsConverterAvailableFormats.isImage(parts[1])){
    dataForDb["imageFile"] = file.id + '.' +  parts[1];
    console.log('Photo recieved');
  }
  else if(parts[1] == 'txt'){
    console.log('Title recieved');
    dataForDb["title"] = iconv.encode(iconv.decode(downloadedData, "cp1251"), "utf8").toString();
    console.log(dataForDb["title"]);
  }
}

function sendToDb(data) {
  if(!data.includes(undefined))
  {
    let currentDate = new Date();
    let year = currentDate.getFullYear().toString();
    let month = (currentDate.getMonth() + 1).toString();
    let day = currentDate.getDate().toString();
    let published = year + '-' + month + '-' + day;
    db.insertNews(data["title"], published, data["contentName"], data["imageFile"]);
  }
  console.log('Done');
}

async function downloadFile(fileid, filename, callback) {
  let parts = filename.split('.');
  let bufs = [], resData;
 // return new Promise(function(resolve, reject){
  await global.drive.files.get({fileId: fileid, alt: 'media'}, {responseType: 'stream'},
    function(err, res){
      res.data.on('data', function(data){
        bufs.push(data); 
      })
      .on('end', function(){
        resData = Buffer.concat(bufs);
      })
      .on('error', err => {
        console.log('Error', err);
      })
      .on('end', callback)
    });
  //})
  return resData;
}

function deleteFile(fileid) {
  global.drive.files.delete({
    fileId: fileid
  }, function(err, resp){
      if (err) {
          console.log('Error code:', err.code)
      } else {
          console.log('Successfully deleted');
      }
  });
}