let db = require('../myModules/db');
let iconv = require('iconv-lite');
let newsConverterAvailableFormats = require('../myModules/newsConverterAvailableFormats');
let googleDriveCRUD = require('../myModules/googleDriveCRUD');
let converter = require('../myModules/cloudConverter');

exports.News = class {
  constructor() {
    this.title = -1,
    this.published = -1,
    this.convertedContentId = -1,
    this.convertedContentData = -1,
    this.contentName = -1,
    this.imageFile = -1,
    this.folderId = -1,
    this.GDFolderName = 'news_incomes'
  }
  process(file, downloadedData) {
    let parts = file.name.split('.');
    if(newsConverterAvailableFormats.isDocument(parts[1])){
      this.contentName = file.id;
      converter.sendToConverter(file.name, 'html', downloadedData).then(function (data) {
        this.convertedContentData = data;
        if(this.isCompleted())
          finalProcessing();
      });
      console.log('Content recieved');
    }
    else if(newsConverterAvailableFormats.isImage(parts[1])){
      this.imageFile = file.id + '.' +  parts[1];
      console.log('Photo recieved');
    }
    else if(parts[1] == 'txt'){
      console.log('Title recieved');
      this.title = iconv.encode(iconv.decode(downloadedData, "cp1251"), "utf8").toString();
      console.log(this.title);
    }
    if(this.isCompleted())
      finalProcessing();
  }
  finalProcessing() {
    console.log('Final processing...');
    
    let currentDate = new Date();
    let year = currentDate.getFullYear().toString();
    let month = (currentDate.getMonth() + 1).toString();
    let day = currentDate.getDate().toString();
    this.published = year + '-' + month + '-' + day;
    let googleDriveCredentials = JSON.parse(fs.readFileSync(path.resolve('.') + '/credentials/googleDriveCredentials.json'));
    googleDriveCRUD.createFolder(this.title, googleDriveCredentials['news_all']).then(function(folderId) {
      googleDriveCRUD.moveFile(this.imageFile.split('.')[0], folderId);
      googleDriveCRUD.storeFiles(this.contentName, this.convertedContentData, folderId).then(function(fileId) {
        this.convertedContentId = fileId;
        this.folderId = folderId;
        db.insertNews(this.title, this.published, this.contentName, this.imageFile, this.folderId, this.convertedContentId);
      })
    });
    console.log('Done final processing');
  }
  isCompleted(){
    let allFields = [
      this.title,
      this.convertedContentData,
      this.contentName,
      this.imageFile
    ];
    console.log('DATA:');
    console.log(this.title);
    console.log(this.convertedContentData);
    console.log(this.contentName);
    console.log(this.imageFile);
    return !allFields.includes(-1);
  }
}