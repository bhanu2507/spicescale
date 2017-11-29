//const express = require('express');

//const cheerio = require('cheerio');
const cheerioReq = require('cheerio-req');
const Firestore = require('@google-cloud/firestore');

cheerioReq('http://www.idlebrain.com//index2.html', (err, $) => {
    //console.log($('#content table tr:nth-child(3) td table tr td table tr td:nth-child(5) table tr:nth-child(5) td p font').html());
    let trailers = [];
    trailers = $('#content table tr:nth-child(3) td table tr td table tr td:nth-child(5) table tr:nth-child(5) td p font').html().split('<br>');
    //console.log(trailers);
    for (let trail of trailers) {
        //console.log(trail.substring(trail.lastIndexOf('="')+1,trail.lastIndexOf('">')).replace('"', ''));
        //console.log('http://www.idlebrain.com/' + trail.substring(trail.lastIndexOf('="')+1,trail.lastIndexOf('">')).replace('"', ''));
        await cheerioReq('http://www.idlebrain.com/' + trail.substring(trail.lastIndexOf('="')+1,trail.lastIndexOf('">')).replace('"', ''), (err, $) => {
            console.log($('#fb-root').html());
        })
    }

})


/* const firestore = new Firestore({
    projectId: 'spicescale-291ce',
    keyFilename: './spicescale-0309023d13b5.json',
  });

const document = firestore.doc('posts/intro-to-firestore');
  
  // Enter new data into the document.
  document.set({
    title: 'Welcome to Firestore',
    body: 'Hello World',
  }).then(() => {
    // Document created successfully.
  }).catch((error) => {
      console.log(error);
  }); */
    

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

    /* let $ = cheerio.load('<h2 class="title">Hello world</h2>');
    console.log($("h2.title").text()); */