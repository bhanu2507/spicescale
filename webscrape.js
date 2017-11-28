//const express = require('express');

//const cheerio = require('cheerio');
const cheerioReq = require('cheerio-req');
/* const app = express();

app.get('/scrape', function(req, res){



}) */

/* url = 'http://www.idlebrain.com';

    request(url, function(error, response, html) {

        if(!error){
            let $ = cheerio.load('<h2 class="title">Hello world</h2>');
                console.log($("h2.title").text());
            
        }
        else {
            console.log(error);
        }
    }) */
cheerioReq('http://www.idlebrain.com', (err, $) => {
    console.log($('#content table tr:nth-child(3) td table tr td table tr td:nth-child(5) table tr:nth-child(5)').text());
})
    /* let $ = cheerio.load('<h2 class="title">Hello world</h2>');
    console.log($("h2.title").text()); */