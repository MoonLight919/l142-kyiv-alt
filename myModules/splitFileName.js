exports.getExtension = function (filename) {
    return filename.split('.').pop();
}
exports.filename = function (filename) {
    let arr = filename.split('.');
    arr.pop();
    return arr.join('');
}