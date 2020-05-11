let db = require('../myModules/db');
let iconv = require('iconv-lite');
let newsConverterAvailableFormats = require('../myModules/newsConverterAvailableFormats');
let gdCRUD = require('../googleDriveApi/googleDriveCRUD');
let converter = require('../myModules/cloudConverter');
let fs = require('fs');
let path = require('path');
let pathHelper = require('../myModules/pathHelper');

exports.News = class {
  constructor() {
    this.title = -1,
    this.published = -1,
    this.convertedContentId = -1,
    this.convertedContentData = -1,
    this.contentId = -1,
    this.imageFile = -1,
    this.imageData = -1,
    this.folderId = -1,
    this.GDFolderName = 'news_incomes',
    this.localDirectory = pathHelper.data_newsDirectory,
    this.dbKeyValue = {
      'folderId' : 0,
      'convertedContentId' : 1,
      'imageFile' : 2
    },
    this.uploadable = true;
  }
  processFile(file, downloadedData) {
    let parts = file.name.split('.');
    if(newsConverterAvailableFormats.isDocument(parts[1])){
      this.contentId = file.id;
      converter.sendToConverter(file.name, 'html', downloadedData).then((data) => {
        this.convertedContentData = data;
        if(this.isDbRequestCompleted())
          this.sendToDb();
      });
      console.log('Content recieved');
    }
    else if(newsConverterAvailableFormats.isImage(parts[1])){
      this.imageFile = file.id + '.' +  parts[1];
      this.imageData = downloadedData;
      console.log('Photo recieved');
    }
    else if(parts[1] == 'txt'){
      console.log('Title recieved');
      this.title = iconv.encode(iconv.decode(downloadedData, "cp1251"), "utf8").toString();
      console.log(this.title);
    }
    if(this.isDbRequestCompleted())
      this.sendToDb();
  }
  sendToDb() {
    console.log('Final processing...');
    
    let currentDate = new Date();
    let year = currentDate.getFullYear().toString();
    let month = (currentDate.getMonth() + 1).toString();
    let day = currentDate.getDate().toString();
    this.published = year + '-' + month + '-' + day;
    let googleDriveCredentials = JSON.parse(fs.readFileSync(path.resolve('.') + '/credentials/googleDriveCredentials.json'));
    //uploading to google drive
    gdCRUD.createFolder(this.title, googleDriveCredentials['news_all']).then((folderId) => {
      gdCRUD.moveFile(this.imageFile.split('.')[0], folderId);
      gdCRUD.moveFile(this.contentId, folderId);
      gdCRUD.storeFile(this.contentId, this.convertedContentData, folderId).then((fileId) => {
        //shitty approach
        //gdCRUD.moveFile(folderId, googleDriveCredentials['news_all']);
        this.convertedContentId = fileId;
        this.folderId = folderId;
        db.insertNews(this.title, this.published, this.convertedContentId, this.contentId, this.imageFile, this.folderId);
      })
      //saving locally
      let pathToFolder = pathHelper.data_newsDirectory + folderId
      fs.mkdirSync(pathToFolder);
      fs.writeFileSync(pathToFolder + '/image.' + this.imageFile.split('.')[1], this.imageData);
      fs.writeFileSync(pathToFolder + '/content.html', this.convertedContentData);
    });

    console.log('Done final processing');
  }
  isDbRequestCompleted(){
    let allFields = [
      this.title,
      this.convertedContentData,
      this.contentId,
      this.imageFile
    ];
    console.log('DATA:');
    console.log(this.title);
    console.log(this.convertedContentData);
    console.log(this.contentId);
    console.log(this.imageFile);
    return !allFields.includes(-1);
  }
  toDelete(filename){
    return filename.split('.')[1] == 'txt';
  }
  toDownload(filename){
    let ext = filename.split('.')[1];
    return ext == 'txt' || newsConverterAvailableFormats.isDocument(ext);
  }
  downloadData(){
    global.allNewsLoaded = false;
    return new Promise((resolve, reject)=>{
    db.getAllNewsFolders().then((dbRes)=>{
      return Promise.all(dbRes.map((res)=>{
        gdCRUD.listFiles(res[this.dbKeyValue['folderId']], false).then((files)=>{
          if(files != false){
            let pathToFolder = this.localDirectory + res[this.dbKeyValue['folderId']];
            fs.mkdirSync(pathToFolder);
            let imageParts = res[this.dbKeyValue['imageFile']].split('.');
            let imageName = 'image.' + imageParts[1];
            let imageId = imageParts[0];
            let contentParts = res[this.dbKeyValue['convertedContentId']].split('.');
            let contentId = contentParts[0];
            return gdCRUD.downloadFile(imageId).then((downloadedData)=>{
              fs.writeFileSync(pathToFolder + '/' + imageName, downloadedData);
            }).then(()=>{
              return gdCRUD.downloadFile(contentId).then((downloadedData)=>{
                fs.writeFileSync(pathToFolder + '/content.html', downloadedData);
                console.log('Resolved news');
              });
            });
          }
          else{
            //console.log(files);
            
            db.deleteNews(res[this.dbKeyValue['folderId']]);
          }
        })
      }))
    }).then(()=>{
      global.allNewsLoaded = true;
      resolve(1);
    });
  })
  }
  canBeDownloaded(){
    global.allNewsLoaded = true;
  }
}