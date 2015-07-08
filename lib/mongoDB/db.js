'use strict';
var mongo = require('mongodb').MongoClient;
var config = require('../config').db;

var mongoDB = function(){
    this.db = null;
    this.collection = {};

    this.init = function(callback){
    };
    this.getDB = function(cb){
        var self = this;
        mongo.connect(`mongodb://localhost:27017/${config.name}`,function(error,database){
            if(error){
                console.error(error);
            }
            else{
                let db = database;
                if(cb){
                    cb.call(self,db);
                }
            }
        })

    };
    this.getZhihuCollection = function(){
        if(!this.collection.zhihu){
            this.collection.zhihu = {
                answers:this.db.collection('zhihu.answers'),
                questions:this.db.collection('zhihu.questions')
            }
        }
        return this;
    };
    this.updateZhihuQuestion = function(questionID,questionInfo,callback){
        this.getDB(function(db){
            var self = this;
            var questionSet = {};
            var answersList = [];
            if(questionInfo.title){
                questionSet.title = questionInfo.title;
            }
            if(questionInfo.desc){
                questionSet.desc = questionInfo.desc;
            }
            if(questionInfo.exploreYear){
                questionSet.exploreYear = questionInfo.exploreYear;
                questionSet.exploreMonth = questionInfo.exploreMonth;
                questionSet.exploreDate = questionInfo.exploreDate;
            }
            if(questionInfo.answersList){
                answersList = questionInfo.answersList;
                if(!(answersList instanceof Array ) &&
                    (typeof answersList == 'string')){
                    answersList = [answersList];
                }
            }
            questionSet.modifiedTime = this.getModifiedTime();
            db.collection('zhihu.questions').update({
                    '_id':questionID
                },
                {
                    '$set': questionSet,
                    '$addToSet':{
                        'answersList':{
                            '$each':answersList
                        }
                    }
                },
                {
                    upsert: true
                },
                function(error,result){
                    db.close();
                    db = null;
                    if(error){
                        console.error(error);
                    }
                    else{
                        console.log(`update zhihu question(${questionID}) done`);
                    }
                });
        });
    };
    this.createZhihuAnswer = function(answerID,answerInfo,callback){
        var self = this;
        this.getDB(function(db){
            db.collection('zhihu.answers').update({
                    '_id':answerID
                },
                {
                    '$set':{
                        'questionID': answerInfo.questionID,
                        'exploreYear':answerInfo.exploreYear,
                        'exploreMonth': answerInfo.exploreMonth,
                        'exploreDate': answerInfo.exploreDate,
                        'modifiedTime': this.getModifiedTime()
                    }
                },
                {
                    upsert:true
                },
                function(error,result){
                    db.close();
                    db = null;
                    if(error){
                        console.error(error);
                    }
                    else{
                        console.log(`add new answer with answerID(${answerID})`);
                    }
                })

        });
    };
    this.updateAuthorInfo = function(answerID,authorInfo,callback){
        var self = this;
        this.getDB(function(db){
            db.collection('zhihu.answers').update({
                    '_id': answerID
                },
                {
                    '$set':{
                        'authorImg': authorInfo.img,
                        'authorName': authorInfo.name,
                        'authorDetail': authorInfo.detail,
                        'modifiedTime': this.getModifiedTime()
                    }
                },
                {
                    'upsert': true
                },
                function(error,result){
                    db.close();
                    db = null;
                    if(error){
                        console.error(error);
                    }
                    else{
                        console.log(`update author information with answerID(${answerID})`);
                    }
                })
        });
    };
    this.updateAnswerInfo = function(answerID,answerInfo,callback){
        var self = this;
        this.getDB(function(db){
            db.collection('zhihu.answers').update(
                {
                    '_id': answerID
                },
                {
                    '$set':{
                        'upvote': answerInfo.upvote,
                        'content': answerInfo.content,
                        'modifiedTime': this.getModifiedTime()
                    }
                },{
                    upsert:true
                },
                function(error,result){
                    db.close();
                    db = null;
                    if(error){
                        console.error(error);
                    }
                    else{
                        console.log(`update answer information with answerID(${answerID})`);
                    }
                }
            )
        });
    };
    this.findZhihuQuestion =  function(){
        var self = this;
        this.getDB(function(db){
            db.collection('zhihu.questions').find({}).toArray(function(error,result){
                db.close();
                db = null;
                if(error){
                    console.error(error);
                }
                else{
                    console.log(result)
                }
            });

        });
    };
    this.insertHasZhihuCrawler = function(){
        var self = this;
        this.getDB(function(db){
            var time = new Date();
            db.collection('zhihu.hasCrawler').update({
                    year:time.getFullYear(),
                    month: time.getMonth(),
                    date: time.getDate()
                },{
                    '$set':{
                        hasCrawler: true,
                        modifiedTime: this.getModifiedTime()
                    }
                },{
                    upsert:true
                },
                function(error,result){
                    db.close();
                    db = null;
                    if(error){
                        console.error(error);
                    }
                    else{
                        console.log('insert zhihu hasCrawler');
                    }
                })
        });
    };
    this.findHasZhihuCrawler = function(time,callback){
        var self = this;
        this.getDB(function(db){
            db.collection('zhihu.hasCrawler').findOne(
                {
                    year:time.year,
                    month: time.month,
                    date: time.date
                },
                {
                    '_id': 0,
                    'hasCrawler':1
                },
                function(error,result){
                    db.close();
                    db = null;
                    if(error){
                        console.error(error);
                    }
                    else{
                        callback(result);
                    }
                })
        });
    };

    this.getModifiedTime = function(){
        var modifiedTime  = new Date();
        return `${modifiedTime.getFullYear()}-${modifiedTime.getMonth()+1}-${modifiedTime.getDate()} ${modifiedTime.getHours()}:${modifiedTime.getMinutes()}:${modifiedTime.getSeconds()}`;
    };

};
module.exports = new mongoDB();
