'use strict';
var zhihu = require('./crawler/zhihu');
var async = require('async');
var db = require('./mongoDB/db');

function run(){
    var timer = setInterval(function(){
        if(db.db){
            crawlerDaily();
            clearInterval(timer);
        }
    },10);
    var loopTime = 60*60*1000;
    setInterval(function(){
        crawlerDaily();
    },loopTime);
}

function crawlerDaily(){
    let time = new Date();
    db.findHasZhihuCrawler.call(db,{
        year:time.getFullYear(),
        month:time.getMonth(),
        date:time.getDate()
    },function(result){
        if(!result){
            db.insertHasZhihuCrawler.call(db);
            zhihu.explore.crawlerRun();
        }
    });
}

module.exports = {
    run:run
};