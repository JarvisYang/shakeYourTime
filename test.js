'use strict'
var phantom = require('phantom');

phantom.create(function (ph) {
    ph.createPage(function (page) {
        page.open("http://www.zhihu.com/node/ExploreAnswerListV2?params=%7B%22offset%22%3A40%2C%22type%22%3A%22day%22%7D", function (status) {
                  /*page.evaluate(function () { return document.title;  }, function (result) {
                              console.log('Page title is ' + result);
                                      ph.exit();
                                            
                  });*/
                 page.render('zhihu.png');
                 ph.exit()
                      
        });
          
    });

});

