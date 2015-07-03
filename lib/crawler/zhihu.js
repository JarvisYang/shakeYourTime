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
            answerList:{},
            year:2015,
            month:1,
            date:1,
            addNewAnswerList:function(){//判断是否已创建对应对象
                var time = new Date();
                this.year = time.getFullYear();
                this.month = time.getMonth() + 1;
                this.date = time.getDate();
                if(this.answerList[this.year] == undefined){
                    this.answerList[this.year] = {};
                }
                if(this.answerList[this.month] == undefined){
                    this.answerList[this.year][this.month] = {};
                }
                if(this.answerList[this.date] == undefined){
                    this.answerList[this.year][this.month][this.date] = {};
                }
                this.crawlerOrder = 0;
                this.getQAID();
            },
            getQAID: function(){
                var self = this;
                var answerList = self.answerList[this.year][this.month][this.date];
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

                                    if(!answerList[questionID]){
                                        answerList[questionID] = {
                                            answers:{}
                                        };
                                    }
                                    if(!answerList[questionID].answers[answerID]){
                                        answerList[questionID].answers[answerID] = {};
                                    }
                                    console.log('questionID:' + questionID)
                                });
                                console.log(`crawler ${decodeURIComponent(exploreUrl)} done`);
                                self.crawlerOrder += 5;
                                self.getQAID();
                            }
                            else{
                                console.log(JSON.stringify(self.answerList));
                                self.getQAinfoByQAID();
                            }
                        }
                    }
                });
            },
            getQAinfoByQAID:function(){
                var answerList = this.answerList[this.year][this.month][this.date];
                var self = this;
                var urlList  = [];
                var urlIndex = 0;
                for(let questionID in answerList){
                    for(let answerID in answerList[questionID].answers ){
                        urlList.push({
                            questionID:questionID,
                            answerID:answerID
                        });

                    }
                }
                async.whilst(function(){
                    return urlIndex < urlList.length;
                },
                function(callback){
                    jsdom.env({
                        url:`http://www.zhihu.com/question/${urlList[urlIndex].questionID}/answer/${urlList[urlIndex].answerID}`,
                        src: [jquery],
                        done: function (errors, window) {
                            let $ = window.jQuery;
                            //var data = $('body').eq(0).html();
                            if(errors){
                                console.error(errors);
                            }
                            else{
                                console.log(`crawler http://www.zhihu.com/question/${urlList[urlIndex].questionID}/answer/${urlList[urlIndex].answerID} done`);
                                if(answerList[urlList[urlIndex].questionID].title == undefined){
                                    console.log($('.zm-item-title').eq(0).children().eq(0).html())
                                    //console.log(document.getElementsByClassName('zm-item-title')[0].innerHTML)
                                }
                                urlIndex++;
                                callback();
                            }
                        }
                    })
                },
                function(error){
                    console.error(error);
                });
            },
            getQuestionInfo:function(data,questionID,$){
            }

        }
    }
};

module.exports = Zhihu;



