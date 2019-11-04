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
    this.contentName = -1,
    this.imageFile = -1,
    this.folderId = -1,
    this.GDFolderName = 'news_incomes'
  }
  async transitionalProcessing(file, downloadedData) {
    let parts = file.name.split('.');
    if(newsConverterAvailableFormats.isDocument(parts[1])){
      this.contentName = file.id;
      this.convertedContentId = await converter.sendToConverter(file.name, 'html' ,downloadedData)
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
  }
  finalProcessing() {
    console.log('Final processing...');
    
    let currentDate = new Date();
    let year = currentDate.getFullYear().toString();
    let month = (currentDate.getMonth() + 1).toString();
    let day = currentDate.getDate().toString();
    let published = year + '-' + month + '-' + day;
    let googleDriveCredentials = JSON.parse(fs.readFileSync(path.resolve('.') + '/credentials/googleDriveCredentials.json'));
    googleDriveCRUD.createFolder(this.title, googleDriveCredentials['news_all']).then(function(folderId) {
      googleDriveCRUD.moveFile(this.imageFile.split('.')[0], folderId);
      googleDriveCRUD.storeFiles(this.contentName, this.convertedContentId, folderId).then(function(folderId) {
        db.insertNews(this.title, published, this.contentName, this.imageFile, folderId, this.convertedContentId);
      })
    });
    console.log('Done final processing');
  }
  isCompleted(){
    let allFields = [
      this.title,
      this.published,
      this.convertedContentId,
      this.contentName,
      this.imageFile,
      this.folderId,
    ];
    return !allFields.includes(-1);
  }
}