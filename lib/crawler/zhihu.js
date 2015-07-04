'use strict';
var phantom = require('phantom');
var jsdom = require('jsdom');
var async = require('async');
var fs = require('fs');
var jquery = fs.readFileSync(__dirname + "/../../public/javascripts/jquery.js", "utf-8");
var cookieJar = jsdom.createCookieJar();

var Zhihu = {
    explore:{
        date:{
            exploreURL: ['http://www.zhihu.com/node/ExploreAnswerListV2?params=%7B%22offset%22%3A',
                '%2C%22type%22%3A%22day%22%7D'],
            crawlerOrder: 0,
            colletion:{},
            year:2015,
            month:1,
            date:1,
            urlList:[],
            addNewAnswerList:function(){//判断是否已创建对应对象
                var time = new Date();
                this.year = time.getFullYear();
                this.month = time.getMonth() + 1;
                this.date = time.getDate();
                if(this.colletion[this.year] == undefined){
                    this.colletion[this.year] = {};
                }
                if(this.colletion[this.month] == undefined){
                    this.colletion[this.year][this.month] = {};
                }
                if(this.colletion[this.date] == undefined){
                    this.colletion[this.year][this.month][this.date] = {
                        questions:{},
                        answers:{}
                    };
                }
                this.crawlerOrder = 0;
                this.getQAID();
            },
            getQAID: function(){
                var self = this;
                var exploreUrl = self.exploreURL[0]
                    + self.crawlerOrder
                    + self.exploreURL[1];

                jsdom.env({//分析知乎发现页面，获取所有对应的问题id和回答id
                    url:exploreUrl,
                    src: [jquery],
                    cookieJar:cookieJar,
                    done: function (errors, window) {
                        if(errors){
                            console.error(errors);
                        }
                        else{
                            let $ = window.jQuery;
                            if($('body').eq(0).html().length != 0){//若对应连接存在内容
                                $(".question_link").each(function(){
                                    var questionInfo = $(this).attr('href').split('/');
                                    var infoLen = questionInfo.length;
                                    var questionID = questionInfo[infoLen - 3];
                                    var answerID = questionInfo[infoLen - 1];
                                    self.addQAID(questionID,answerID);
                                });
                                console.log(`crawler ${decodeURIComponent(exploreUrl)} done`);
                                self.crawlerOrder += 5;
                                self.getQAID();
                            }
                            else{
                                console.log(JSON.stringify(self.colletion));
                                self.getQAinfoByQAID();
                            }
                        }
                    }
                });
            },
            getQAinfoByQAID:function(){
                var collection = this.getCollection();
                var self = this;
                var urlIndex = 0;
                async.whilst(function(){
                    return urlIndex < self.urlList.length;
                },
                function(callback){
                    jsdom.env({
                        url:`http://www.zhihu.com/question/${self.urlList[urlIndex].questionID}/answer/${self.urlList[urlIndex].answerID}`,
                        src: [jquery],
                        done: function (errors, window) {
                            let $ = window.jQuery;
                            if(errors){
                                console.error(errors);
                            }
                            else{
                                console.log(`crawler http://www.zhihu.com/question/${self.urlList[urlIndex].questionID}/answer/${self.urlList[urlIndex].answerID} done`);
                                if(collection.questions[self.urlList[urlIndex].questionID].title == undefined){
                                    self.addQuestionTitle(self.urlList[urlIndex].questionID,$('.zm-item-title').eq(0).children().eq(0).html())
                                }
                                urlIndex++;
                                callback();
                            }
                        }
                    })
                },
                function(error){
                    if(error){
                        console.error(error);
                    }
                    else{
                        console.log(JSON.stringify(self.getCollection()))
                    }
                });
            },
            getCollection: function(){
                return this.colletion[this.year][this.month][this.date];
            },
            addQuestionTitle: function(questionID,title){
                console.log(questionID,title);
                this.getCollection().questions[questionID].title = title;
            },
            addQAID: function(questionID,answerID){
                var collection = this.getCollection();
                if(!collection.questions[questionID]){//add the new question object if questionID is not in collection.questions
                    collection.questions[questionID] = {
                        answersList:[answerID]
                    };
                    collection.answers[answerID] = {
                        questionID:questionID
                    };
                }
                else if(collection.answers[answerID]){
                    collection.questions[questionID].answers.push(answerID);
                    collection.answers[answerID] = {
                        questionID: questionID
                    }
                }
                this.addUrlList(questionID,answerID);
            },
            addUrlList:function(questionID,answerID){
                this.urlList.push({
                    questionID: questionID,
                    answerID: answerID
                })
            }


        }
    }
};

module.exports = Zhihu;



