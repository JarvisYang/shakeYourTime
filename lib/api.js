var express = require('express');
var router = express.Router();
var db = require('./mongoDB/db');

/* GET home page. */
router.get('/article', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('')

module.exports = router;