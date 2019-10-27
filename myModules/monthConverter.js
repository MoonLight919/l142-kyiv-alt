exports.numToUA = function(number){
//export function numToUA(number) {
    let arr = {
        '0' : 'Січня',
        '1' : 'Лютого',
        '2' : 'Березня',
        '3' : 'Квітня',
        '4' : 'Травня',
        '5' : 'Червня',
        '6' : 'Липня',
        '7' : 'Серпня',
        '8' : 'Вересня',
        '9' : 'Жовтня',
        '10' : 'Листопада',
        '11' : 'Грудня',
    }
    return arr[number];
}

exports.EngToUA = function(number){
//export function EngToUA(number) {
    let arr = {
        'Jan' : 'Січня',
        'Fab' : 'Лютого',
        'Mar' : 'Березня',
        'Apr' : 'Квітня',
        'May' : 'Травня',
        'Jun' : 'Червня',
        'Jul' : 'Липня',
        'Aug' : 'Серпня',
        'Sep' : 'Вересня',
        'Oct' : 'Жовтня',
        'Nov' : 'Листопада',
        'Dec' : 'Грудня',
    }
    return arr[number];
}