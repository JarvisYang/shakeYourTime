'use strict';
var jsdom = require('jsdom');
var async = require('async');
var fs = require('fs');
var db = require('../mongoDB/db');
var jquery = fs.readFileSync(__dirname + "/../../public/javascripts/jquery.js", "utf-8");
var cookieJar = jsdom.createCookieJar();


function addNewAnswerList(cb){//判断是否已创建对应对象
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
    this.getQAID(cb);
}
function getQAID(cb){
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
                    self.getQAID(cb);
                }
                else{
                    console.log(JSON.stringify(self.collection));
                    self.getQAinfoByQAID(cb);
                }
            }
        }
    });
}
function getQAinfoByQAID(cb){
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
                    if(errors){
                        console.error(errors);
                    }
                    else{
                        var $ = window.jQuery;
                        console.log(`crawler http://www.zhihu.com/question/${questionID}/answer/${answerID} done`);
                        let jsSidebarAuthorInfoEle =   $('#js-sidebar-author-info').eq(0);
                        let zhQuestionAnswerWrap =  $('#zh-question-answer-wrap').eq(0);
                        if(collection.questions[questionID].title == undefined){
                            self.addQuestionInfo(questionID,{
                                title:$('#zh-question-title').eq(0).find('a').html(),
                                desc:$('#zh-question-detail').find('.zm-editable-content').eq(0).html()
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
                cb();
                db.findZhihuQuestion();
            }
        });
}
function getCollection(){
    return this.collection[this.year][this.month][this.date];
}
function addQAID(questionID,answerID){
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
    db.createZhihuAnswer(answerID,{
        questionID:questionID,
        exploreYear: this.year,
        exploreMonth: this.month,
        exploreDate: this.date
    });
    this.addUrlList(questionID,answerID);
}
function addUrlList(questionID,answerID){
    this.urlList.push({
        questionID: questionID,
        answerID: answerID
    })
}
function addQuestionInfo(questionID,questionInfo){
    var question = this.getCollection().questions[questionID];
    question.title = questionInfo.title;
    question.desc = questionInfo.desc?this.simplifyCrawlerData(questionInfo.desc):'';
    db.updateZhihuQuestion(questionID,{
        title:question.title,
        desc:question.desc,
        type:this.type,
        exploreYear:this.year,
        exploreMonth:this.month,
        exploreDate:this.date,
        answersList:question.answersList
    });
}
function addAuthorInfo(answerID,authorInfo){
    var answer = this.getCollection().answers[answerID];
    answer.authorImg = authorInfo.img;
    answer.authorName = authorInfo.name;
    answer.authorDetail = authorInfo.detail?authorInfo.detail:'';
    db.updateAuthorInfo(answerID,{
        img: answer.authorImg,
        name: answer.authorName,
        detail: answer.authorDetail
    })
}
function addAnswerInfo(answerID,answerInfo){
    var answer = this.getCollection().answers[answerID];
    answer.upvote = answerInfo.upvote;
    answer.content = answerInfo.content?this.simplifyCrawlerData(answerInfo.content):'';
    db.updateAnswerInfo(answerID,{
        upvote:answer.upvote,
        content:answer.content
    })
}
function simplifyCrawlerData(data){
    //var deleteTagReg = /(<strong>|<\/strong>|<p>|<u>|<\/u>|<a href="javascript:;" class="zu-edit-button" name="edit"><i class="zu-edit-button-icon"><\/i>修改<\/a>)/g;
    //var reduceBrTag = /(<br>){2,}/g;
    //data = data.replace(deleteTagReg,'').replace(/(<\/p>)/g,'<br>').replace(reduceBrTag,'<br>');
    var deleteTagReg = /(<noscript><[\w\d\s\-="\:\/\.]*>[^>]*<\/noscript>|<a href="javascript:;" class=\"zu-edit-button" name="edit"><i class="zu-edit-button-icon"><\/i>修改<\/a>)/g;
    var createImgSrc = /"\/\/s1\.zhimg\.com\/misc\/whitedot\.jpg"[\w\s\d\-=\/\:\."]*data-actualsrc=/g;
    var deleteAttrReg = /\s((([a-g]|[i-r]|[t-z])|(s([^r]|r[^c]))|h([^r]|r([^e]|e[^f])))[\w-]*|s|sr|src[\w-]+|h|hr|hre|href[\w-]+)="[\w\s\d\.\:\/_\-]+"/g;
    //console.log('all attr:' + data.match(/(\w+|-)=\"\S\"/g));
    //console.log(data.match(deleteAttrReg));
    //var reduceBrTag = /(<br>){2,}/g;
    data = data.replace(deleteTagReg,'').replace(createImgSrc,'').replace(deleteAttrReg,' ');
    //data = data.replace(deleteAttrReg,' ');

    return data;
}

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
            type:'day',
            addNewAnswerList:addNewAnswerList,
            getQAID: getQAID,
            getQAinfoByQAID: getQAinfoByQAID,
            getCollection: getCollection,
            addQAID: addQAID,
            addUrlList: addUrlList,
            addQuestionInfo: addQuestionInfo,
            addAuthorInfo: addAuthorInfo,
            addAnswerInfo: addAnswerInfo,
            simplifyCrawlerData: simplifyCrawlerData
        },
        month:{
            exploreURL: ['http://www.zhihu.com/node/ExploreAnswerListV2?params=%7B%22offset%22%3A',
                '%2C%22type%22%3A%22month%22%7D'],
            crawlerOrder: 0,
            collection:{},
            year:2015,
            month:1,
            date:1,
            urlList:[],
            type:'month',
            addNewAnswerList:addNewAnswerList,
            getQAID: getQAID,
            getQAinfoByQAID: getQAinfoByQAID,
            getCollection: getCollection,
            addQAID: addQAID,
            addUrlList: addUrlList,
            addQuestionInfo: addQuestionInfo,
            addAuthorInfo: addAuthorInfo,
            addAnswerInfo: addAnswerInfo,
            simplifyCrawlerData: simplifyCrawlerData
        },
        crawlerRun: function () {
            var self = this;
            async.waterfall([
                    function(cb){
                        self.date.addNewAnswerList(function(){
                            cb(null)
                        });
                    },
                    function(cb){
                        self.month.addNewAnswerList(function(){
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

    }
};

module.exports = Zhihu;



