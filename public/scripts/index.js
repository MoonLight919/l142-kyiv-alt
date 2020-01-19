$(function(){
    // setTimeout(function()
    // {        
        let oldw, oldh, oldl, oldt, alreadyOpened, clones = [];
        function openCard(){
            if(alreadyOpened)
            {
                var e = jQuery.Event( "click" );
                closeCardTempHandler(e);
            }
            alreadyOpened = true;
            let w =  $(window).width() * 0.6;
            let h =  $(window).height() * 0.6;
            oldw = $(this).width();
            oldh = $(this).height();
            let left = $(window).width() / 2 - w / 2;
            let top = $(window).height() / 2 - h / 2;
            clones.push($(this).clone(true, true));
            $($(this).children()[0]).css('transform', 'rotateY(180deg)');
            $($(this).children()[1]).css({
                'transform': 'rotateY(0deg)',
                'z-index' : '51'
            });
            let pos = $(this).offset();
            oldl = pos.left;
            oldt = pos.top;
            $(this).css({
                'position' : 'fixed',
                'z-index' : '51',
                'top' : pos.top - window.pageYOffset,
                'left' : pos.left,
                'width' : $(this).width(),
                'height' : $(this).height(),
                'border' : "none"
            });
            $(this).animate({
                'top' : top,
                'left' : left,
                'width' : w,
                'height' : h
            }, 1000);
            $(this).promise().then(function() {
                $(this).css({
                    'box-shadow': '0px 0px 0px 9999px rgba(0, 0, 0, 0.6)',
                    // 'transition' : '.6s filter',
                    // 'filter': 'blur(5px)'
                });
                let ccth = closeCardTempHandler;
                $('section').on('click', ccth);
                $(this).addClass('opened-card');
            });
        }
        $('.flip-card').click(openCard);

        //close card
        function closeCardTempHandler(e) {
            alreadyOpened = false;
            let obj = $('.opened-card')[0];
            if(e.currentTarget != obj){
                $($(obj).children()[0]).css('transform', 'rotateY(0deg)');
                $($(obj).children()[1]).css({
                    'transform': 'rotateY(180deg)',
                    'z-index' : '0'
                });
                $(obj).animate({
                    'width' : oldw,
                    'height' : oldh,
                }, 1000);
                $(obj).offset({top : oldt, left : oldl}); // option1
                $(obj).promise().then(function() {
                    $(obj).css({
                        'box-shadow': 'none',
                    });
                    //$(obj).offset({top : oldt, left : oldl}); // option2
                    setTimeout(() => {
                        $(obj).replaceWith(clones.shift());
                    }, 400);
                });
                let ccth = closeCardTempHandler;
                $('section').off('click', ccth);
            }
        }
        function constructStudents(data) {
            let arr = [];
            data.forEach(element => {
                arr['carousel_item'] = $('<div/>', {
                    "class" : 'car-item item w-100'
                });
                arr['picture'] = $('<img/>', {
                    "src" : element.imageSrc,
                    "class" : 'img-carousel'
                });
                arr['name'] = $('<p/>', {
                    "class" : 'text-2 text-color-white'
                });
                arr['description'] = $('<p/>', {
                    "class" : 'text-1'
                });
                $(arr['name']).text(element.name);
                $(arr['description']).text(element.description);

                $(arr['carousel_item']).append(arr['picture']);
                $(arr['carousel_item']).append(arr['name']);
                $(arr['carousel_item']).append(arr['description']);
                $('#myCar').append(arr['carousel_item']);
            });
            onWindowResize();
        }
        //request for data for news widget
        //temporary disabled 
        // $.post(
        //     "/news",
        //     {
        //         page: 0,
        //         amount: 5
        //     },
        //     constructNewsWidget
        // );
        $.post(
            "/index",
            constructStudents
        );
        //construct carousel
        let oldWindowWidth = window.innerWidth; 
        function onWindowResize() {
            let size1, size2, cnt;
            if(window.innerWidth <= 1200){
                if(window.innerWidth >= 768){
                        size1 = "offset-sm-2 col-sm-3";
                        size2 = "offset-sm-2 col-sm-3";
                        cnt = 2;
                }
                else{
                        size1 = "offset-sm-3 col-sm-6";
                        //size2 = "offset-sm-1 col-sm-2";
                        cnt = 1;
                }
            }
            else{
                size1 = "offset-sm-2 col-sm-2";
                size2 = "offset-sm-1 col-sm-2";
                cnt = 3;
            }

            let arr = $('.car-item');
            let classes, row, elem, elemOuter;
            let parent = $('#myCar');
            $(parent).empty();
            for (let i = 0; i < arr.length;) {
                classes = i == 0 ? 
                    "carousel-item w-100 active" : 
                    "carousel-item w-100";
                row = $('<div/>', {
                    "class" : classes,
                    "data-interval" : "6000"
                });
                elemOuter = $('<div/>', {
                    "class" : "d-flex flex-row"
                });
                for (let j = i; j < i + cnt; j++) {
                    classes = j == i ? size1 : size2;
                    elem = $('<div/>', {
                        "class" : classes
                    });
                    $(elem).append(arr[j]);
                    $(elemOuter).append(elem);
                    $(row).append(elemOuter);
                }
                $(row).append(elemOuter);
                $(parent).append(row);
                i += cnt;
            }
            oldWindowWidth = window.innerWidth; 
        };
        $(window).resize(onWindowResize);
    // }, 3000);
})