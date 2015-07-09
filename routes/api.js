'use strict';
var express = require('express');
var router = express.Router();
var config = require('../lib/config');
var db = require('../lib/mongoDB/db');
var video = require('../lib/video');
var game = require('../lib/game');

/* GET home page. */
router.get('/article', function(req, res, next) {
    findAnswer(req,res);
});

router.get('/video',function(req,res,next){
    var videoInfo = video.getRandomVideo();
    res.json({
        'url': `http://player.youku.com/embed/${videoInfo['_id']}`,
        'title': videoInfo.title,
        'desc': videoInfo.description
    });
});
router.get('/game',function(req,res,next){
    var gameInfo = game.getRandomGame();
    res.json(gameInfo);
});

function findAnswer(req,res){
    db.findAllAnswerID(function(result){
        var index = Math.floor(Math.random()*result.length);
        console.log(result[index]);
        db.findAnswerByAnswerID(result[index]['_id'],function(answerInfo){
            //answerInfo.url = `http://${config.rootIP}:3000/article/zhihu/${answerInfo['_id']}`;
            if(!answerInfo.content || !answerInfo.questionTitle){
                findAnswer(req,res);
            }
            else{
                res.json({
                    'title': answerInfo.questionTitle,
                    'desc': answerInfo.content.slice(0,15),
                    'url': `http://${config.rootIP}:3000/article/zhihu/${answerInfo['_id']}`
                });
            }

        });
    });

}

module.exports = router;
