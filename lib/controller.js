'use strict';
var zhihu = require('./crawler/zhihu');
var async = require('async');

function run(){
    async.waterfall([
        function(cb){
            zhihu.explore.date.addNewAnswerList(function(){
                cb(null)
            });
        },
        function(cb){
            zhihu.explore.month.addNewAnswerList(function(){
                cb(null,'done');
            });
        }
    ],
    function(error,result){
        if(error){
            console.error(error);
        }
        else{
            console.log(result);
        }
    });
}

module.exports = {
    run:run
};