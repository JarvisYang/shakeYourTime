'use strict';
var express = require('express');
var router = express.Router();
var config = require('../lib/config');
var db = require('../lib/mongoDB/db');

router.get('/zhihu/:answerID',function(req,res,next){
    var answerID = req.param('answerID');
    db.findAnswerByAnswerID(answerID,function(answerInfo){
        console.log(answerInfo);
        res.render('article', answerInfo);
    });
});

module.exports = router;
