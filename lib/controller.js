'use strict';
var zhihu = require('./crawler/zhihu');

function run(){
    zhihu.explore.date.addNewAnswerList();
}

module.exports = {
    run:run
};