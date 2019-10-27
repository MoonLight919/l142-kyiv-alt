exports.isDocument = function(fileExt){
//export function isDocument (fileExt) {
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
    return docs.includes(fileExt);
}

exports.isImage = function(fileExt){
//export function isImage (fileExt) {
    let images = [
        'jpeg', 
        'webp', 
        'gif', 
        'png', 
        'apng', 
        'ico', 
        'bmp', 
        'jpg'
    ];
    return images.includes(fileExt);
}