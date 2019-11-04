const { Client } = require('pg');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let config = JSON.parse(fs.readFileSync(path.resolve('.') + '/credentials/dbCredentials.json'));

const client = new Client(config["herokuMainDb"]);
const pool = new Pool(config["herokuMainDb"]);

//export function createNewsTable()
exports.createNewsTable = function()
{ 
  client.connect();
  client.query(`CREATE TABLE News
    (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      published DATE NOT NULL,
      convertedContentId TEXT NOT NULL,
      contentName TEXT NOT NULL,
      imageFile TEXT NOT NULL,
      folderId TEXT NOT NULL
    )`, (err, res) => {
    if (err) throw err;
    for (let row of res.rows) {
      console.log(JSON.stringify(row));
    }
    client.end();
  });
}
//export function dropTable(name)
exports.dropTable = function(name)
{ 
  client.connect();
  client.query(`DROP TABLE ${name}`, (err, res) => {
    if (err) throw err;
    for (let row of res.rows) {
      console.log(JSON.stringify(row));
    }
    client.end();
  });
}
//export function truncateTable(name)
exports.truncateTable = function(name)
{ 
  client.connect();
  client.query(`TRUNCATE ${name} RESTART IDENTITY;`, (err, res) => {
    if (err) throw err;
    for (let row of res.rows) {
      console.log(JSON.stringify(row));
    }
    client.end();
  });
}
//export function changeEncoding()
exports.changeEncoding = function()
{ 
  client.connect();
  client.query(`SET CLIENT_ENCODING TO 'UTF8';`, (err, res) => {
    if (err) throw err;
    for (let row of res.rows) {
      console.log(JSON.stringify(row));
    }
    client.end();
  });
}
//export function showEncoding()
exports.showEncoding = function()
{ 
  client.connect();
  client.query(`SHOW client_encoding;`, (err, res) => {
    if (err) throw err;
    for (let row of res.rows) {
      console.log(JSON.stringify(row));
    }
    client.end();
  });
}
//export function createAdditionalTable()
exports.createAdditionalTable = function()
{ 
  client.connect();
  client.query(`CREATE TABLE Additional
    (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    value TEXT NOT NULL
    )`, (err, res) => {
    if (err) throw err;
    for (let row of res.rows) {
      console.log(JSON.stringify(row));
    }
    client.end();
  });
}
//export function checkConnection()
exports.checkConnection = function()
{ 
  client.connect();
  client.query(`SELECT table_schema,table_name 
                  FROM information_schema.tables;`, (err, res) => {
    if (err) throw err;
    for (let row of res.rows) {
      console.log(JSON.stringify(row));
    }
    client.end();
  });
}
//export function insertNews(title, published, contentName, imageFile)
exports.insertNews = function(title, published, convertedContentId, contentName, imageFile, folderId)
{ 
  client.connect();
  client.query(`INSERT INTO News (
    title, 
    published, 
    convertedContentId, 
    contentName, 
    imageFile, 
    folderId
  ) 
  VALUES (
    '${title}', 
    '${published}', 
    '${convertedContentId}', 
    '${contentName}', 
    '${imageFile}, 
    '${folderId}'
  '); 
  UPDATE Additional 
  SET value = value::int + 1 
  WHERE name like 'NewsRowsCount'`, (err, res) => {
    if (err) {
      console.log(err);
      
    throw err;
    }
    client.end();
  });
}
//export function createNewsRowsCount()
exports.createNewsRowsCount = function()
{ 
  client.connect();
  client.query(`INSERT INTO Additional (name, value) 
                VALUES ('NewsRowsCount', 0)`, (err, res) => {
    if (err) throw err;
    for (let row of res.rows) {
      console.log(JSON.stringify(row));
    }
    client.end();
  });
}
//export async function getManyNews(page, amount)
exports.getManyNews = async function(page, amount)
{
  let client = await pool.connect()
  let result = await client.query({
    rowMode: 'array',
    text: `SELECT *
          FROM News 
          WHERE id::int <= 
          ((SELECT value 
          FROM Additional 
          WHERE name like 'NewsRowsCount'
          limit 1)::int - ${amount * page})`,
  });
  await client.end()
  console.log('Sending news...');
  return result.rows;
}
//export async function getNewsByIndex(index)
exports.getNewsByIndex = async function(index)
{
  let client = await pool.connect()
  let result = await client.query({
    rowMode: 'array',
    text: `SELECT contentName FROM news WHERE id = ${index}`,
  });
  await client.end()
  console.log(result.rows[0]);
  return result.rows[0];
}