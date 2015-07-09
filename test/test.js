'use strict';
var db = require('../lib/mongoDB/db.js');
var async = require('async');

function test(){
    var errorAnswerList = [];
    db.findAllAnswerID(function(result){
        let index = 0;
        async.whilst(function(){
            return index < result.length;
        },
        function(callback){
            console.log(result[index],result[index].hasOwnProperty('questionID'));
            if(result[index].hasOwnProperty('questionID')){
                db.findAnswerByAnswerID(result[index]['_id'],function(answerInfo){
                    if(!answerInfo.hasOwnProperty('questionID') ||
                        !answerInfo.hasOwnProperty('authorImg') ||
                        !answerInfo.hasOwnProperty('authorName') ||
                        !answerInfo.hasOwnProperty('content') ||
                        !answerInfo.hasOwnProperty('questionTitle') ||
                        !answerInfo['questionID']||
                        !answerInfo['authorImg']||
                        !answerInfo['authorName']||
                        !answerInfo['content']||
                        !answerInfo['questionTitle']){
                        errorAnswerList.push(answerInfo['_id']);
                    }
                    index++;
                    callback();
                })
            }
            else{
                errorAnswerList.push( result[index]['_id']);
                console.log('no question ID:' + result[index]['_id']);
                index++;
                callback();
            }

        },
        function(error,result_1){
            if(error){
                console.error(error);
            }
            else{
                console.log(errorAnswerList);
                let index = 0;
                async.whilst(function(){
                    return index < errorAnswerList.length;
                },
                function(callback){
                    //db.removeAnswerByAnswerID(errorAnswerList[index],function(){
                        index++;
                        callback();
                    //})
                },
                function(error,result){
                    if(error) console.error(error);
                });
                console.log('result.length:' + result.length);
                console.log('error length:' + errorAnswerList.length);
            }
        });
    });
}

test();