import {loadContent} from './common.js';

$(function(){
    let request = '/teachers';
    let allLoadedFieldName = 'allTeachersLoaded';
    $('#loading').show();
    function constructTeachers(data) {
        if(data.content.length > 0)
            $('#loading').hide();
        let arr = [];
        $('#teachersContent').empty();
        data.content.forEach(department => {
            arr['header'] = $('<div/>', {
                "class" : 'item margin-top-50 department-header'
            });
            arr['header-content'] = $('<h3/>', {
                "class" : 'text-3 text-color-teal'
            });
            $(arr['header-content']).text(department.name);
            $(arr['header']).append(arr['header-content']);
            arr['row'] = $('<div/>', {
                "class" : 'row margin-top-50 teachers-row'
            });
            department.teachers.forEach(teacher=>{
                arr['cols'] = $('<div/>', {
                    "class" : 'col-lg-3 col-md-6 col-sm-12'
                });
                arr['item'] = $('<div/>', {
                    "class" : 'item'
                });
                arr['picture'] = $('<img/>', {
                    "src" : teacher.imageSrc,
                    "class" : 'teacher-image'
                });
                arr['name'] = $('<p/>', {
                    "class" : 'text-color-seagreen text-2'
                });
                arr['description'] = $('<p/>', {
                    "class" : 'text-1'
                });
                $(arr['name']).text(teacher.name);
                $(arr['description']).text(teacher.description);
                $(arr['item']).append(arr['picture']);
                $(arr['item']).append(arr['name']);
                $(arr['item']).append(arr['description']);
                $(arr['cols']).append(arr['item']);
                $(arr['row']).append(arr['cols']);
            });
            $('#teachersContent').append(arr['header']);
            $('#teachersContent').append(arr['row']);
        });
    }
    loadContent(request, allLoadedFieldName, constructTeachers);
});