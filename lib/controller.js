'use strict';
var Zhihu = require('./crawler/zhihu');
var async = require('async');
var db = require('./mongoDB/db');

function run(){
    crawlerDaily();
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
            var zhihu = new Zhihu();
            db.insertHasZhihuCrawler.call(db);
            zhihu.explore.crawlerRun(function(){
                zhihu = null;
            });
        }
    });
}

module.exports = {
    run:run
};