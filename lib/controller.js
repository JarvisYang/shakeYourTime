'use strict';
var zhihu = require('./crawler/zhihu');
var async = require('async');
var db = require('./mongoDB/db');

function run(){
    var loopTime = 60*60*1000;
    setInterval(function(){
        let time = new Date();
        db.findHasZhihuCrawler({
            year:time.getFullYear(),
            month:time.getMonth(),
            date:time.getDate()
        },function(result){
            if(!result){
                db.insertHasZhihuCrawler();
                zhihu.explore.crawlerRun();
            }
        });
    },loopTime);
}

module.exports = {
    run:run
};