import {loadContent} from './common.js';

$(function(){
    let params = {
        page : 1,
        amount : 2
    }
    let request = '/news';
    let allLoadedFieldName = 'allNewsLoaded';
    $('#loading').show();
    function showNews(data)
    {
        if(data.content.length > 0)
            $('#loading').hide();
        if(data.haveMoreNews == false)
            $('#loadMore').hide();
        else
            $('#loadMore').show();
        let arr = [];
        data.content.reverse().forEach(element => {
            arr['news_item'] = $('<div/>', {
                "class" : 'news-item col-sm-11 col-md-5 col-lg-3 item myborder'
            });
            arr['date_block'] = $('<div/>', {
                "class" : 'background-color-teal text-color-white date-block text-center'
            });
            $(arr['date_block']).text(element.published);
            arr['ref'] = $('<a/>', {
                "class" : 'item flex-grow-1 w-100 justify-content-around',
                "href" : 'news/' + element.id
            });
            arr['picture'] = $('<img/>', {
                "src" : element.imageSrc
            });
            arr['title'] = $('<p/>');
            arr['title'].text(element.title);
            $(arr['ref']).append(arr['picture']);
            $(arr['ref']).append(arr['title']);
            $(arr['news_item']).append(arr['date_block']);
            $(arr['news_item']).append(arr['ref']);
            $('#upload').append(arr['news_item']);
        });
    }
    loadContent(request, allLoadedFieldName, showNews, false, params);
    $('#loadMore').on('click', function() {
        params['page'] += 1;
        loadContent(request, allLoadedFieldName, showNews, false, params);
    });
})