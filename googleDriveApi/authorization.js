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
let path = require('path');
let fs = require('fs');
let News = require('../models/news');
let gdCRUD = require('../googleDriveApi/googleDriveCRUD');

// If modifying these scopes, delete token.json.
const SCOPES = [
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive'
];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
let googleDriveCRUD = require('./googleDriveCRUD');

exports.readCredentialsAndAuthorize = function() {
  console.log('reading credentials...');
  
  // Load client secrets from a local file.
    let credentials = fs.readFileSync(path.resolve('.') + '/credentials/credentials.json');

    // Authorize a client with credentials, then call the Google Drive API.
    //return new Promise(function(resolve, reject){
    return authorize(JSON.parse(credentials), (auth) => {
      global.drive = google.drive({version: 'v3', auth});
      console.log('Drive created!');
    })
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