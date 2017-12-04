//const express = require('express');

//const cheerio = require('cheerio');
const cheerioReq = require('cheerio-req');
const Firestore = require('@google-cloud/firestore');
var fs = require('fs');
var youtubedl = require('youtube-dl');

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
        let trailnm = trail.substring(trail.lastIndexOf('">')+1,trail.lastIndexOf('</a')).replace('>','').replace('/','*');
        //console.log(trailnm, trailnm.lastIndexOf('<'));
        //console.log(trail.substring(trail.lastIndexOf('="')+1,trail.lastIndexOf('">')).replace('"', ''));
        let trailurl = 'http://www.idlebrain.com/' + trail.substring(trail.lastIndexOf('="')+1,trail.lastIndexOf('">')).replace('"', '');
        if (trailnm.lastIndexOf('<') == -1) {
            deldocs(function(res){
                getytlink(trailurl, function(ytlink){
                    console.log(trailnm.search("trailer"));
                    if ((ytlink != undefined) & (trailnm.search("trailer") != -1) ) {
                        ydtl(trailnm,ytlink, function(res){
                            console.log(trailnm, ytlink);
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
                        })
                    }
                });
            })

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

async function deldocs (callback) {
    const query = firestore.collection('trailers');
    await query.get().then(querySnapshot => {
        querySnapshot.forEach(documentSnapshot => {
            //console.log(`Found document at ${documentSnapshot.ref.path}`);
            if (documentSnapshot.exists) {                
            let documentRef = firestore.doc(documentSnapshot.ref.path);
            documentRef.delete();
            };  
        });
      });
    callback('true');  
}

async function ydtl (nm, yln, callback) {
        console.log(yln);
        //let video = youtubedl('http://www.youtube.com/watch?v=X6vSXWi0HOA',
        let video = youtubedl(yln,
        // Optional arguments passed to youtube-dl.
        ['--format=18'],
        // Additional options can be given for calling `child_process.execFile()`.
        { cwd: __dirname });
    
        // Will be called when the download starts.
    await video.on('info', function(info) {
            /* console.log('Download started');
            console.log('filename: ' + info._filename);
            console.log('size: ' + info.size); */
            video.pipe(fs.createWriteStream(info._filename + '.mp4'));
        });
        callback('true');
}