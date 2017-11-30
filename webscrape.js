//const express = require('express');

//const cheerio = require('cheerio');
const cheerioReq = require('cheerio-req');
const Firestore = require('@google-cloud/firestore');

const firestore = new Firestore({
    projectId: 'spicescale-291ce',
    keyFilename: './spicescale-0309023d13b5.json',
  });

cheerioReq('http://www.idlebrain.com//index2.html', (err, $) => {
    //console.log($('#content table tr:nth-child(3) td table tr td table tr td:nth-child(5) table tr:nth-child(5) td p font').html());
    let trailers = [];
    trailers = $('#content table tr:nth-child(3) td table tr td table tr td:nth-child(5) table tr:nth-child(5) td p font').html().split('<br>');
    //console.log(trailers);
    for (let trail of trailers) {
        //console.log(trail.substring(trail.lastIndexOf('="')+1,trail.lastIndexOf('">')).replace('"', ''));
        //console.log('http://www.idlebrain.com/' + trail.substring(trail.lastIndexOf('="')+1,trail.lastIndexOf('">')).replace('"', ''));
        let trailnm = trail.substring(trail.lastIndexOf('">')+1,trail.lastIndexOf('</a')).replace('>','');
        //console.log(trailnm, trailnm.lastIndexOf('<'));
        let trailurl = 'http://www.idlebrain.com/' + trail.substring(trail.lastIndexOf('="')+1,trail.lastIndexOf('">')).replace('"', '');
        if (trailnm.lastIndexOf('<') == -1) {
            getytlink(trailurl, function(ytlink){
                //console.log(trailnm, ytlink);
                const document = firestore.doc('trailers/'+trailnm);
                if (ytlink != undefined) {
                // Enter new data into the document.
                document.set({
                    title: trailnm,
                    url: ytlink,
                  }).then(() => {
                    // Document created successfully.
                  }).catch((error) => {
                      console.log(error);
                  });
                }
            });
        }
    }

})


async function getytlink (chtml, callback) {
    let ytlink = '';
    await cheerioReq(chtml, (err, $) => {
        //console.log($('body table tr:nth-child(6) td table tr td table tr td:nth-child(2) table tr td p iframe').attr("src"));
        ytlink = $('body table tr:nth-child(6) td table tr td table tr td:nth-child(2) table tr td p iframe').attr("src");
    })
    callback(ytlink);
}
