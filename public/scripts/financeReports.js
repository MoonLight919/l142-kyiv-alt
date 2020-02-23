import {receiveFile} from './common.js';

$(function(){
    $('#loading').show();
    function constructReports(data)
    {
        if(data.content.length > 0)
            $('#loading').hide();
        $('.container').empty();
        data.content.reverse().forEach(period => {
            arr['ul'] = $('<ul/>', {
                "class" : 'list-group margin-top-1'
            });
            arr['period'] = $('<li/>', {
                "class" : 'list-group-item list-group-item-primary text-center'
            });
            $(arr['period']).text(period.name);
            $(arr['ul']).append(arr['period']);
            period.reports.forEach(report=>{
                arr['report'] = $('<li/>', {
                    "class" : 'list-group-item list-item',
                    "data-index" : report,
                    "data-group" : period.name,
                });
                $(arr['report']).text(report);
                $(arr['ul']).append(arr['report']);
            });
            $('.container').append(arr['ul']);
        });
        $('.list-item').click(function (e) {
            receiveFile('financeReports', e);
        });
    }
    let allLoaded = false;
    let intervalId = setInterval(()=>{
        $.get(
            "/financeReports/all",
            function(data) {
                allLoaded = data.allLoaded;
                constructReports(data);
            }
        );
        console.log(allLoaded);     
        if(allLoaded){
            clearInterval(intervalId);
        }
    } , 1000);
});