const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
var schedule = require('node-schedule');
let db = require('./db');
let pathHelper = require('./pathHelper');
var iconv = require('iconv-lite');

let images = ['jpeg', 'webp', 'gif', 'png', 'apng', 'ico', 'bmp', 'jpg'];
let docs = [
  'abw', 
  'csv', 
  'doc', 
  'docm', 
  'docx', 
  'dot', 
  'dotx', 
  'dps', 
  'et', 
  'htm', 
  'key', 
  'key.zip', 
  'lwp' ,
  'md' ,
  'numbers', 
  'numbers.zip', 
  'odp' ,
  'ods' ,
  'odt' ,
  'pages', 
  'pages.zip', 
  'pdf' ,
  'pot' ,
  'potx' ,
  'pps' ,
  'ppsx' ,
  'ppt' ,
  'pptm' ,
  'pptx' ,
  'ps' ,
  'rst' ,
  'rtf' ,
  'sda' ,
  'sdc' ,
  'sdw' ,
  'wpd' ,
  'wps' ,
  'xls' ,
  'xlsm' ,
  'xlsx' ,
  'zabw' 
];

// If modifying these scopes, delete token.json.
const SCOPES = [
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive'
];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

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
  let keys = ['news'];
  let processingFunctions = [processNews];
  for (let index = 0; index < keys.length; index++) {
    global.drive.files.list({
      q: `'${googleDriveCredentials.folders[keys[index]]}' in parents`,
      pageSize: 10,
      fields: 'nextPageToken, files(id, name)',
    }, async function(err, res){
      if (err) return console.log('The API returned an error: ' + err);
      let files = res.data.files;
      if (files.length) {
        console.log('Files:');
        for (let index = 0; index < files.length; index++) {
          let deleteFunction = deleteFile.bind(null, files[index].id);
          console.log(`${files[index].name} (${files[index].id})`);
          await downloadFile(files[index].id, files[index].name, deleteFunction);
        }
        processingFunctions[index](files);
      } else {
        console.log('No files found.');
      }
    });
  }
}

function processNews(files) {
  let data = [];
  files.forEach(element => {
    let parts = element.name.split('.');
    if(docs.includes(parts[1])){
      data["contentName"] = element.id;
      console.log('Content recieved');
    }
    else if(images.includes(parts[1])){
      data["imageFile"] = element.id + '.' +  parts[1];
      console.log('Photo recieved');
    }
    else if(parts[1] == 'txt'){
      console.log('Title recieved');
      data["title"] = fs.readFileSync(pathHelper.dataDirectory + 'news_drive/' + element.id + '.txt');
      data["title"] = iconv.encode(iconv.decode(data["title"], "cp1251"), "utf8").toString();
      console.log(data["title"]);
    }
  });
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

function downloadFile(fileid, filename, callback) {
  let parts = filename.split('.');
  let path = './data/news_drive/' + fileid + '.' +  parts[1];
  var dest = fs.createWriteStream(path.toString(), {encoding: 'utf8'});
  return new Promise(function(resolve, reject){
    global.drive.files.get({fileId: fileid, alt: 'media'}, {responseType: 'stream'},
    function(err, res){
      res.data.on('end', () => {
        if(docs.includes(parts[1])){
          sendToConverter(fileid + '.' +  parts[1]);
          console.log('Sent to converter');
        }
        console.log('done downloadFile');
        resolve('done downloadFile');
      })
      .on('error', err => {
        console.log('Error', err);
      })
      .on('end', callback)
      .pipe(dest);
    });
  });
}

exports.startSchedule = function startSchedule(timeString) {
  var job = schedule.scheduleJob(timeString, async function(){
    if(global.drive == undefined){
      readCredentialsAndAuthorize().then(listFiles);
    }
    else
      listFiles()
  });
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

exports.sendToConverter = sendToConverter;

function sendToConverter(filename) {
  cloudconvert = new (require('cloudconvert'))('sJo6q3UWyqWZP40py0HhLt1EFuToyZuMPzdG5oMs0fLXwlUjehaq9xtsMyX1G3NJ');
  let parts = filename.split('.');
  fs.createReadStream( pathHelper.dataDirectory + 'news_drive/' + filename)
  .pipe(cloudconvert.convert({
      "inputformat": parts[1],
      "outputformat": "html",
      "input": "upload",
      "converteroptions": {
          "page_range": null,
          "outline": null,
          "zoom": 1.5,
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
  }))
  .pipe(fs.createWriteStream(pathHelper.dataDirectory + 'news_html/' + parts[0] + '.html'));
}