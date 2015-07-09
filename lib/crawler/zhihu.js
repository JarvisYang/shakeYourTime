'use strict';
var jsdom = require('jsdom');
var async = require('async');
var fs = require('fs');
var db = require('../mongoDB/db');
var jquery = fs.readFileSync(__dirname + "/../../public/javascripts/jquery.js", "utf-8");

var addNewAnswerList = function(cb){//判断是否已创建对应对象
    var time = new Date();
    this.year = time.getFullYear();
    this.month = time.getMonth() + 1;
    this.date = time.getDate();
    this.crawlerOrder = 0;
    this.getQAID(cb);
};
var getQAID = function(cb){
    var self = this;
    var exploreUrl = self.exploreURL[0]
        + self.crawlerOrder
        + self.exploreURL[1];

    jsdom.env({//分析知乎发现页面，获取所有对应的问题id和回答id
        url:exploreUrl,
        src: [jquery],
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
                        self.addUrlList(questionID,answerID);
                    });
                    console.log(`crawler ${decodeURIComponent(exploreUrl)} done`);
                    self.crawlerOrder += 5;
                    self.getQAID(cb);
                }
                else{
                    self.getQAinfoByQAID(cb);
                }
            }
        }
    });
};
var getQAinfoByQAID = function(cb){
    var self = this;
    var urlIndex = 0;
    var jsSidebarAuthorInfoEle = null;
    var zhQuestionAnswerWrap = null;
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
                        jsSidebarAuthorInfoEle =   $('#js-sidebar-author-info').eq(0);
                        zhQuestionAnswerWrap =  $('#zh-question-answer-wrap').eq(0);
                        //if(collection.questions[questionID].title == undefined){
                        self.insertAnswer(answerID,questionID);
                        self.addQuestionInfo(questionID,{
                            title:$('#zh-question-title').eq(0).find('a').html(),
                            desc:$('#zh-question-detail').find('.zm-editable-content').eq(0).html(),
                            answerList: self.getAnswerIDByQuestionID(questionID)
                        });
                        self.addAuthorInfo(answerID,{
                            img:jsSidebarAuthorInfoEle.find('.zm-item-img-avatar').eq(0).attr('src'),
                            name:jsSidebarAuthorInfoEle.find('.zg-link').eq(0).html(),
                            detail:jsSidebarAuthorInfoEle.find('.zg-big-gray').eq(0).html()
                        });
                        self.addAnswerInfo(answerID,{
                            upvote: zhQuestionAnswerWrap.find('.count').eq(0).html(),
                            content:zhQuestionAnswerWrap.find('.zm-editable-content').eq(0).html()
                        });
                        //}
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
                self.urlList = null;
            }
        });
};
var getAnswerIDByQuestionID = function(questionID){
    var answerList = [];
    for(let i = 0;i < this.urlList.length; i++){
        if(this.urlList[i].questionID == questionID){
            answerList.push(this.urlList[i].answerID);
        }
    }
    return answerList;
};
var addUrlList = function(questionID,answerID){
    for(let i = 0;i <  this.urlList.length; i++){
        if(this.urlList[i].answerID == answerID){
            return;
        }
    }
    this.urlList.push({
        questionID: questionID,
        answerID: answerID
    })
};
var insertAnswer = function(answerID,questionID){
    db.createZhihuAnswer(answerID,{
        questionID:questionID,
        exploreYear: this.year,
        exploreMonth: this.month,
        exploreDate: this.date
    });
};
var addQuestionInfo = function(questionID,questionInfo){
    db.updateZhihuQuestion(questionID,{
        title:questionInfo.title,
        desc:questionInfo.desc?this.simplifyCrawlerData(questionInfo.desc):'',
        exploreYear:this.year,
        exploreMonth:this.month,
        exploreDate:this.date,
        answersList:questionInfo.answersList
    });
};
var addAuthorInfo = function(answerID,authorInfo){
    db.updateAuthorInfo(answerID,{
        img: authorInfo.img,
        name: authorInfo.name,
        detail: authorInfo.detail?authorInfo.detail:''
    })
};
var addAnswerInfo = function(answerID,answerInfo){
    db.updateAnswerInfo(answerID,{
        upvote:answerInfo.upvote,
        content:answerInfo.content?this.simplifyCrawlerData(answerInfo.content):''
    })
};
var simplifyCrawlerData = function(data){
    var deleteTagReg = /(<noscript><[\w\d\s\-="\:\/\.]*>[^>]*<\/noscript>|<a href="javascript:;" class=\"zu-edit-button" name="edit"><i class="zu-edit-button-icon"><\/i>修改<\/a>)/g;
    var createImgSrc = /"\/\/s1\.zhimg\.com\/misc\/whitedot\.jpg"[\w\s\d\-=\/\:\."]*data-actualsrc=/g;
    var deleteAttrReg = /\s((([a-g]|[i-r]|[t-z])|(s([^r]|r[^c]))|h([^r]|r([^e]|e[^f])))[\w-]*|s|sr|src[\w-]+|h|hr|hre|href[\w-]+)="[\w\s\d\.\:\/_\-]+"/g;
    data = data.replace(deleteTagReg,'').replace(createImgSrc,'').replace(deleteAttrReg,' ');

    return data;
};

var Zhihu = function(){
    this.explore = {
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
            getAnswerIDByQuestionID:getAnswerIDByQuestionID,
            getQAID: getQAID,
            getQAinfoByQAID: getQAinfoByQAID,
            addUrlList: addUrlList,
            insertAnswer:insertAnswer,
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
            getAnswerIDByQuestionID:getAnswerIDByQuestionID,
            getQAID: getQAID,
            getQAinfoByQAID: getQAinfoByQAID,
            insertAnswer:insertAnswer,
            addUrlList: addUrlList,
            addQuestionInfo: addQuestionInfo,
            addAuthorInfo: addAuthorInfo,
            addAnswerInfo: addAnswerInfo,
            simplifyCrawlerData: simplifyCrawlerData
        },
        crawlerRun: function (callback) {
            var self = this;
            async.waterfall([
                    function(cb){
                        self.date.addNewAnswerList(function(){
                            cb(null)
                        });
                    },
                    function(cb){
                        self.date = null;
                        setTimeout();
                        self.month.addNewAnswerList(function(){
                            cb(null,'done');
                        });
                    }
                ],
                function(error,result){
                    callback();
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



