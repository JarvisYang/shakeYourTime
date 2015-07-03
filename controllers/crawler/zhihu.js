'use strict'
var phantom = require('phantom');
var async = require('async');


var Zhihu = {
    explore:{
        date:{
            exploreURL: ['http://www.zhihu.com/node/ExploreAnswerListV2?params=%7B%22offset%22%3A',
                '%2C%22type%22%3A%22day%22%7D'],
            crawlerOrder: 0,
            answerList:{},
            addNewAnswerList:function(){
                var time = new Date();
                var year = time.getFullYear();
                var month = time.getMonth() + 1;
                var date = time.getDate();
                if(this.answerList[year] == undefined){
                    this.answerList[year] = {};
                }
                if(this.answerList[month] == undefined){
                    this.answerList[year][month] = {};
                }
                if(this.answerList[date] == undefined){
                    this.answerList[year][month][date] = {};
                }

                this.crawlerRun(year,month,date);
            },
            crawlerRun: function(year,month,date){
                var self = this;
                var answerList = self.answerList[year][month][date];
                phantom.create(function (ph) {
                    ph.createPage(function (page) {
                        var exploreUrl = self.exploreURL[0]
                            + self.crawlerOrder
                            + self.exploreURL[1];
                        page.open(exploreUrl, function(status) {
                            page.render('zhihu.png');
                            if(status == 'success'){
                                page.evaluate(
                                    function () {

                                        var questionEle = Array.prototype.slice.call(document.getElementsByClassName('question_link'));
                                        /*var result = [];
                                        questionEle.forEach(function(value,index,array) {
                                            let questionInfo = value.href.split('/');
                                            let questionID = questionInfo[4];
                                            let answerID = questionInfo[6];
                                            result.push({
                                                questionID:questionID,
                                                answerID:answerID
                                            });
                                        });
                                        return result;*/
                                        //return document.body.innerHTML;
                                        return document.querySelectorAll('.question_link')
                                    },
                                    function (result) {
                                        console.log(result);
                                        /*result.forEach(function(value,index){
                                            if (!answerList[value.questionID]) {
                                                answerList[value.questionID] = {
                                                    answers: {
                                                        [value.answerID]: {}
                                                    }
                                                }
                                            }
                                            else {
                                                answerList[value.questionID].answers[value.answerID] = {};
                                            }

                                        });
                                        if(self.crawlerOrder < 1){
                                            self.crawlerOrder++;
                                            self.crawlerRun(year,month,date);
                                        }
                                        else{
                                            console.log(JSON.stringify(self.answerList));
                                        }*/
                                        ph.exit();
                                    });
                            }
                            else{
                                console.error('Crawler of Zhihu explore error:' + status);
                            }
                        });
                    });
                });
            }

        }
    }
};

module.exports = Zhihu;



