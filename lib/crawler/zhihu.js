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
            collection:{},
            year:2015,
            month:1,
            date:1,
            urlList:[],
            addNewAnswerList:function(){//判断是否已创建对应对象
                var time = new Date();
                this.year = time.getFullYear();
                this.month = time.getMonth() + 1;
                this.date = time.getDate();
                if(this.collection[this.year] == undefined){
                    this.collection[this.year] = {};
                }
                if(this.collection[this.month] == undefined){
                    this.collection[this.year][this.month] = {};
                }
                if(this.collection[this.date] == undefined){
                    this.collection[this.year][this.month][this.date] = {
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
                                console.log(JSON.stringify(self.collection));
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
                    let questionID = self.urlList[urlIndex].questionID;
                    let answerID  = self.urlList[urlIndex].answerID;
                    jsdom.env({
                        url:`http://www.zhihu.com/question/${questionID}/answer/${answerID}`,
                        src: [jquery],
                        done: function (errors, window) {
                            var $ = window.jQuery;
                            if(errors){
                                console.error(errors);
                            }
                            else{
                                console.log(`crawler http://www.zhihu.com/question/${questionID}/answer/${answerID} done`);
                                let jsSidebarAuthorInfoEle =   $('#js-sidebar-author-info').eq(0);
                                let zhQuestionAnswerWrap =  $('#zh-question-answer-wrap').eq(0);
                                if(collection.questions[questionID].title == undefined){
                                    self.addQuestionInfo(questionID,{
                                        title:$('#zh-question-title').eq(0).find('a').html(),
                                        desc:$('#zh-question-detail').find('.content').val()
                                    });
                                    self.addAuthorInfo(answerID,{
                                        img:jsSidebarAuthorInfoEle.find('.zm-item-img-avatar').eq(0).attr('src'),
                                        name:jsSidebarAuthorInfoEle.find('.zg-link').eq(0).html(),
                                        detail:jsSidebarAuthorInfoEle.find('.zg-big-gray').eq(0).html()
                                    });
                                    self.addAnswerInfo(answerID,{
                                        upvote: zhQuestionAnswerWrap.find('.count').eq(0).html(),
                                        content:zhQuestionAnswerWrap.find('.zm-editable-content').eq(0).html()
                                    })
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
                        //let urlList = self.urlList;
                        //let collection = self.getCollection();
                        //var index = 0;
                        //async.whilst(function(){
                        //   return index < urlList.length;
                        //},
                        //function(callback){
                        //    //var answer = collection.answers[urlList[index].answerID];
                        //    //console.log(index,urlList[index].answerID,urlList[index].questionID);
                        //    if(answer){
                        //        fs.writeFile(__dirname+'/answers/question' + answer.questionID + '_answer' + urlList[index].answerID + '.html',
                        //            '<html><head><meta content="text/html; charset=utf-8" http-equiv="content-type"><\/head><body>'+answer.content+'<\/body><\/html>',
                        //            function(e){
                        //                console.log(__dirname+'/answers/question' + answer.questionID + '_answer' + urlList[index].answerID + '.html')
                        //                if(e) console.log('error:',e);
                        //                index++;
                        //                callback();
                        //            });
                        //    }
                        //
                        //},
                        //function(e){
                        //    if(e){
                        //        console.log(e);
                        //    }
                        //});
                        //console.log(JSON.stringify(self.getCollection()))
                    }
                });
            },
            getCollection: function(){
                return this.collection[this.year][this.month][this.date];
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
            },
            addQuestionInfo: function(questionID,questionInfo){
                var question = this.getCollection().questions[questionID];
                question.title = questionInfo.title;
                question.desc = questionInfo.desc?this.simplifyCrawlerData(questionInfo.desc):'';
            },
            addAuthorInfo: function(answerID,authorInfo){
                var answer = this.getCollection().answers[answerID];
                answer.authorImg = authorInfo.img;
                answer.authorName = authorInfo.name;
                answer.authorDetail = authorInfo.detail?authorInfo.detail:'';
            },
            addAnswerInfo:function(answerID,answerInfo){
                var answer = this.getCollection().answers[answerID];
                answer.upvote = answerInfo.upvote;
                answer.content = this.simplifyCrawlerData(answerInfo.content);
            },
            simplifyCrawlerData: function(data){
                //var deleteTagReg = /(<strong>|<\/strong>|<p>|<u>|<\/u>|<a href="javascript:;" class="zu-edit-button" name="edit"><i class="zu-edit-button-icon"><\/i>修改<\/a>)/g;
                //var reduceBrTag = /(<br>){2,}/g;
                //data = data.replace(deleteTagReg,'').replace(/(<\/p>)/g,'<br>').replace(reduceBrTag,'<br>');
                var deleteTagReg = /(<noscript><[\w\d\s\-="\:\/\.]*>[^>]*<\/noscript>|<a href="javascript:;" class=\"zu-edit-button" name="edit"><i class="zu-edit-button-icon"><\/i>修改<\/a>)/g;
                var createImgSrc = /"\/\/s1\.zhimg\.com\/misc\/whitedot\.jpg"[\w\s\d\-=\/\:\."]*data-actualsrc=/g;
                var deleteAttrReg = /\s((([a-g]|[i-r]|[t-z])|(s([^r]|r[^c]))|h([^r]|r([^e]|e[^f])))[\w-]*|s|sr|src[\w-]+|h|hr|hre|href[\w-]+)="\S+"/g;
                //console.log('all attr:' + data.match(/(\w+|-)=\"\S\"/g));
                console.log(data.match(deleteTagReg));
                //var reduceBrTag = /(<br>){2,}/g;
                 data = data.replace(deleteTagReg,'').replace(createImgSrc,'').replace(deleteAttrReg,' ');
                //data = data.replace(deleteAttrReg,' ');

                return data;
            }


        }
    }
};

module.exports = Zhihu;



