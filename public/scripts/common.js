$(function(){
    //upload common parts of page
    // let links = Array.from($('link[rel=import]'));
    // links.forEach(element => {
    //     $('body').append($(element.import).find('body').html());
    // });    
    //$('[data-toggle="tooltip"]').tooltip();

    //upload content (html imports replacement)
    $('#uploadableContent').load('/uploadableContent', ()=>{
         //make header smaller while scroll down
        window.onscroll = function() {
            if ( window.pageYOffset > 100 )
                $('#top').addClass("top-down");
            else
                $('#top').removeClass("top-down");
        }

        //Set copyright year
        $('#copyright span').text(new Date().getFullYear());

        //rotate angle button of menu while hovering
        $('.menuAngle').add('#menuButtonInner')
        .add('#menuButtonOuter').hover(
            () => {
                $('.menuAngle').css({
                    'transform' : 'rotateX(180deg)'
                });
                $(this).css('cursor', 'pointer');
            },
            () =>{
                $('.menuAngle').css({
                    'transform' : 'rotateX(0deg)'
                });
            }
        );

        //open-close menu
        $('#menuAngleOpen').add('#menuButtonInner')
        .add('#menuAngleClose').add('#menuButtonOuter').click((e)=>{
            $('#leftMenuSide').toggleClass('leftMenuSideOpen')
            $('#rightMenuSide').toggleClass('rightMenuSideOpen');
        });

        //show search input
        $('.searchButton').click((e) =>{
            let pair = $(e.target).attr("data-pair");
            let parent = $(e.target).parent();
            if($(e.target).attr("data-expanded") == "0"){
                $(e.target).attr("data-expanded", "1");
                $(parent).toggleClass('searchExpanded' + pair);
                $(parent).toggleClass('searchCollapsed');
                if(window.innerWidth <= 720 && pair == 1)
                    $('#logo-text').toggleClass('blurred-logo');
            }
            else{
                $(e.target).attr("data-expanded", "0");
                $(parent).toggleClass('searchCollapsed');
                $(parent).toggleClass('searchExpanded' + pair);
                if(window.innerWidth <= 720 && pair == 1)
                    $('#logo-text').toggleClass('blurred-logo');
            }
        });
        $('#bookmark').click((e)=>{
            let th = hideNems;
            $('section').on('click', th);
            $('#news').toggleClass('hide');
            $(e.currentTarget).toggleClass('hide');
        });
    
        //...news widget
        $('#news h2').hover(
            (e)=>{
                $(e.currentTarget).text('Сховати');
                $(e.currentTarget).css('cursor', 'pointer');
            },
            (e)=>{
                $(e.currentTarget).text('Свіжі новини');
            },
        );
    
        $('#news h2').click(hideNems);
    
        function hideNems(e){
            let newsCard = $('#news')[0];
            let th = hideNems;
            if(e.currentTarget != newsCard){
                $('#news').toggleClass('hide');
                $('#bookmark').toggleClass('hide');
                $('section').off('click', th);
            }
        }

        function constructNewsWidget(data) {
            let arr = [];
            let first = true;
            data.forEach(element => {
                let classesForCarousel_item = 'carousel-item h-100';
                if(first){
                    classesForCarousel_item += ' active';
                    first = false;
                }
                
                arr['carousel_item'] = $('<div/>', {
                    "class" : classesForCarousel_item
                });
                arr['flex_element'] = $('<div/>', {
                    "class" : 'd-flex flex-column h-100 w-100'
                });
                arr['title'] = $('<p/>', {
                    "class" : 'text-2'
                });
                arr['ref'] = $('<a/>', {
                    "class" : 'text-2',
                    "href" : 'news/' + element.id
                });
                $(arr['ref']).text(element.title);
                arr['q'] = $('<div/>', {
                    "class" : 'flex-grow-1 w-100'
                });
                arr['picture'] = $('<img/>', {
                    "src" : element.imageSrc
                });
                $(arr['q']).append(arr['picture']);
                $(arr['flex_element']).append(arr['q']);
                $(arr['flex_element']).append(arr['ref']);
                $(arr['carousel_item']).append(arr['flex_element']);
                $('#news .carousel-inner').append(arr['carousel_item']);
            });
        }
        // $.post(
        //     "/news",
        //     {
        //         page: 0,
        //         amount: 5
        //     },
        //     constructNewsWidget
        // );
    });
});

function sendRequest(req, get, params) {
    if(params == undefined)
        params = {};
    return get == true ? $.get(req, params) : $.post(req, params);
};

export let loadContent = async function(
    request, allLoadedFieldName, dataHandler, get, params) {
    let data = await sendRequest(request, get, params);
    dataHandler(data);
    let p = new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve(1);
        }, 1000);
    }).then(()=>{
        if(data[allLoadedFieldName] == false)
            loadContent();
    });
}

//send request and receive file from server
export let receiveFile = function (page, eventData)
{
    let ind = $(eventData.currentTarget).attr('data-index');
    let dataObject;
    switch (page) {
        case 'financeReports':
            let period = $(eventData.currentTarget).attr('data-group');
            dataObject = JSON.stringify({
                "val":ind,
                "group" : period
            });
            break;
        case 'entranceExam':
            dataObject = JSON.stringify({
                "val":ind,
                "group" : ind
            });
            break;
        default:
            break;
    }   
    
    $.ajax({
        url:'/' + page,
        method: 'POST',
        xhrFields: {
            responseType: 'blob'
        },
        data: dataObject,
        contentType: "application/json; charset=utf-8",
        success: function (data, textStatus, request) {
            var a = document.createElement('a');
            var url = window.URL.createObjectURL(data);
            a.href = url;
            a.download = decodeURI(request.getResponseHeader('Filename'))
            document.body.append(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        },
        error: function (jqXHR, textStatus, errorThrown ) {
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
};