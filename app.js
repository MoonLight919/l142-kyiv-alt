// import * as express from 'express';
// import * as path from 'path';
// import * as cookieParser from 'cookie-parser';
// import * as bodyParser from 'body-parser';
// import * as logger from 'morgan';
// import * as schedule from './myModules/news';
// import * as db from './myModules/db';
// import * as https from 'https';
// import * as htmlTableConverter from './myModules/htmlTableConverter';
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var schedule = require('./myModules/news');
var db = require('./myModules/db');
var https = require("https");
var htmlTableConverter = require('./myModules/htmlTableConverter');

var app = express();
var router = require('./router');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router);

//db.truncateTable('additional');
//db.createNewsRowsCount();
//console.log('done');

schedule.startSchedule('5 * * * *');

setInterval(function() {
    https.get("https://l142.herokuapp.com/");
}, 300000); // every 5 minutes

let array = htmlTableConverter.tableToArray(`<table border="1">
<caption>Таблица размеров обуви</caption>
<tr>
 <th>Россия</th>
 <th>Великобритания</th>
 <th>Европа</th>
 <th>Длина ступни, см</th>
</tr>
<tr><td>34,5</td><td>3,5</td><td>36</td><td>23</td></tr>
<tr><td>35,5</td><td>4</td><td>36⅔</td><td>23–23,5</td></tr>
<tr><td>36</td><td>4,5</td><td>37⅓</td><td>23,5</td></tr>
<tr><td>36,5</td><td>5</td><td>38</td><td>24</td></tr>
<tr><td>37</td><td>5,5</td><td>38⅔</td><td>24,5</td></tr>
<tr><td>38</td><td>6</td><td>39⅓</td><td>25</td></tr>
<tr><td>38,5</td><td>6,5</td><td>40</td><td>25,5</td></tr>
<tr><td>39</td><td>7</td><td>40⅔</td><td>25,5–26</td></tr>
<tr><td>40</td><td>7,5</td><td>41⅓</td><td>26</td></tr>
<tr><td>40,5</td><td>8</td><td>42</td><td>26,5</td></tr>
<tr><td>41</td><td>8,5</td><td>42⅔</td><td>27</td></tr>
<tr><td>42</td><td>9</td><td>43⅓</td><td>27,5</td></tr>
<tr><td>43</td><td>9,5</td><td>44</td><td>28</td></tr>
<tr><td>43,5</td><td>10</td><td>44⅔</td><td>28–28,5</td></tr>
<tr><td>44</td><td>10,5</td><td>45⅓</td><td>28,5–29</td></tr>
<tr><td>44,5</td><td>11</td><td>46</td><td>29</td></tr>
<tr><td>45</td><td>11,5</td><td>46⅔</td><td>29,5</td></tr>
<tr><td>46</td><td>12</td><td>47⅓</td><td>30</td></tr>
<tr><td>46,5</td><td>12,5</td><td>48</td><td>30,5</td></tr>
<tr><td>47</td><td>13</td><td>48⅔</td><td>31</td></tr>
<tr><td>48</td><td>13,5</td><td>49⅓</td><td>31,5</td></tr>
</table>`);
console.log('Table:');

console.log(JSON.stringify(array))

module.exports = app;