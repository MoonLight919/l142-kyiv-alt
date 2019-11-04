let streamBuffers = require('stream-buffers');

function cloudconvertOptions(fromExt, toExt) {
    return {
        "inputformat": fromExt,
        "outputformat": toExt,
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

//export async function sendToConverter(filename, downloadedData) {
exports.sendToConverter = sendToConverter;
async function sendToConverter(filename, toExt, downloadedData) {
    cloudconvert = new (require('cloudconvert'))('sJo6q3UWyqWZP40py0HhLt1EFuToyZuMPzdG5oMs0fLXwlUjehaq9xtsMyX1G3NJ');
    let parts = filename.split('.');
    let buffs = [], resData;
    var myReadableStreamBuffer = new streamBuffers.ReadableStreamBuffer({
        frequency: 10,      // in milliseconds.
        chunkSize: 2048     // in bytes.
    }); 
    myReadableStreamBuffer.put(downloadedData);
    await myReadableStreamBuffer.pipe(cloudconvert.convert(cloudconvertOptions(parts[1], toExt))).on('data', function(data){
        buffs.push(data); 
    })
    .on('end', function(){
        resData = Buffer.concat(buffs);
    });
    console.log('Converted file arriving...');
    return resData;
}