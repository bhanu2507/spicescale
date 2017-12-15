
const express = require('express');
const app = express();
const Storage = require('@google-cloud/storage');
const Firestore = require('@google-cloud/firestore');
var fs = require('fs');
var youtubedl = require('youtube-dl');
const video = require('@google-cloud/video-intelligence').v1;
const client = new video.VideoIntelligenceServiceClient();
const bucketName = 'spicescale';
const firestore = new Firestore({
    projectId: 'spicescale-291ce',
    keyFilename: './spicescale-0309023d13b5.json',
  });

let vtitle = '';  
let yln = '';
app.get('/ssvideo', (req, res) => {
    //const yln = 'https://www.youtube.com/watch?v=Dctq41jvM1I';
    //console.log(req.query.ssvideo);
    yln = req.query.ssvideo;
    ydtl(yln, function(res) {
        gsupload(res, function(res) {
            const gcsUri = 'gs://spicescale/' + res;
            //const gcsUri = './myvideo.mp4';
            const document = firestore.doc('trailers/'+res.slice(0,-4));
            const request = {
                inputUri: gcsUri,
                features: ['EXPLICIT_CONTENT_DETECTION'],
            };
            
            // Human-readable ss
            const likelihoods = [
                'UNKNOWN',
                'VERY_UNLIKELY',
                'UNLIKELY',
                'POSSIBLE',
                'LIKELY',
                'VERY_LIKELY',
            ];
            let unknown=0; 
            let very_unlikely=0;
            let unlikely=0;
            let possible=0;
            let likely=0;
            let very_likely=0;

            let unknown_s=[]; 
            let very_unlikely_s=[];
            let unlikely_s=[];
            let possible_s=[];
            let likely_s=[];
            let very_likely_s=[];

            let rating = [];
            // Detects unsafe content
            client
                .annotateVideo(request)
                .then(results => {
                const operation = results[0];
               //console.log('Waiting for operation to complete...');
                return operation.promise();
                })
                .then(results => {
                // Gets unsafe content
                const explicitContentResults =
                    results[0].annotationResults[0].explicitAnnotation;
                console.log('Explicit annotation results:');
                explicitContentResults.frames.forEach(result => {
                    if (result.timeOffset === undefined) {
                    result.timeOffset = {};
                    }
                    if (result.timeOffset.seconds === undefined) {
                    result.timeOffset.seconds = 0;
                    }
                    if (result.timeOffset.nanos === undefined) {
                    result.timeOffset.nanos = 0;
                    }
                    let stime = result.timeOffset.seconds + '.' + (result.timeOffset.nanos / 1e6).toFixed(0)
                    switch (likelihoods[result.pornographyLikelihood]) {
                        case 'UNKNOWN':
                                unknown_s.push({unknown:stime});
                                unknown++;
                                break;
                        case 'VERY_UNLIKELY':
                                very_unlikely_s.push({very_unlikely:stime});
                                very_unlikely++;
                                break;
                        case 'UNLIKELY':
                                unlikely_s.push({unlikely:stime});
                                unlikely++;
                                break;
                        case 'POSSIBLE':
                                possible_s.push({possible:stime});
                                possible++;
                                break;
                        case 'LIKELY':
                                likely_s.push({likely:stime});
                                likely++;
                                break;
                        case 'VERY_LIKELY':
                                very_likely_s.push({very_likely:stime});
                                very_likely++;
                                break;
                    }

                    /* console.log(
                    `\tTime: ${result.timeOffset.seconds}` +
                        `.${(result.timeOffset.nanos / 1e6).toFixed(0)}s`
                    );
                    console.log(
                    `\t\tPornography liklihood: ${
                        likelihoods[result.pornographyLikelihood]
                    }`
                    ); */
                    document.update({
                        'UNKNOWN':unknown_s,
                        'VERY_UNLIKELY':very_unlikely_s,
                        'UNLIKELY':unlikely_s,
                        'POSSIBLE':possible_s,
                        'LIKELY':likely_s,
                        'VERY_LIKELY':very_likely_s,
                      }).then(() => {
                        // Document updated successfully.
                      });
                });
                rating.push({'UNKNOWN':unknown},{'VERY_UNLIKELY':very_unlikely},{'UNLIKELY':unlikely},{'POSSIBLE':possible},{'LIKELY':likely},{'VERY_LIKELY':very_likely});
                //console.log(rating);
                const storage = new Storage();
                    storage
                    .bucket(bucketName)
                    .file(res)
                    .delete()
                    .then(() => {
                    //console.log(`gs://${bucketName}/${res} deleted.`);
                    }) 
                    .catch(err => {
                    console.error('ERROR:', err);
                    });
                })
                .catch(err => {
                console.error('ERROR:', err);
                });
   
        })
    })
})    




async function gsupload(file, callback) {
          //console.log(file);
          const storage = new Storage();
    await storage
          .bucket(bucketName)
          .upload('./trailers/'+file)
          .then(() => {
            //console.log(`${file} uploaded to ${bucketName}.`);
            fs.unlinkSync('./trailers/' + file);
            callback(file);
          })
          .catch(err => {
            console.error('ERROR:', err);
          });

}



async function ydtl (yln, callback) {
    //console.log(yln);
    let vtrail = 0;
    //let video = youtubedl('http://www.youtube.com/watch?v=X6vSXWi0HOA',
    let video = youtubedl(yln,
    // Optional arguments passed to youtube-dl.
    ['--format=18'],
    // Additional options can be given for calling `child_process.execFile()`.
    { cwd: __dirname });

    // Will be called when the download starts.
    d = new Date();
	df = (d.getMonth()+1)+'-'+d.getDate()+'-'+d.getFullYear()+'-'+d.getHours()+'-'+d.getMinutes()+'-'+d.getSeconds();
await video.on('info', function(info) {
        //console.log(info.title);
        //console.log('filename: ' + info._filename);
        /*console.log('size: ' + info.size); */
        //vtrail = info._filename.search("trailer");
        //console.log(df);
        const document = firestore.doc('trailers/'+df);
        //if (ytlink != undefined) {
        // Enter new data into the document.
        document.set({
            title: info.title,
            url: yln
        }).then(() => {
            // Document created successfully.
        }).catch((error) => {
            console.log(error);
        });
        vtitle = info.title;
        //if (info._filename.search("trailer") != -1) {
            video.pipe(fs.createWriteStream('./trailers/' + df + '.mp4'));
        //}
        callback(df + '.mp4');
    });

}

app.listen(3100, () => console.log('Example app listening on port 3100!'))