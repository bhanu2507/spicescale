const Storage = require('@google-cloud/storage');
const Firestore = require('@google-cloud/firestore');
const video = require('@google-cloud/video-intelligence').v1;
const client = new video.VideoIntelligenceServiceClient();
const async = require('async');

const bucketName = 'spicescale';
const firestore = new Firestore({
    projectId: 'spicescale-291ce',
    keyFilename: './spicescale-0309023d13b5.json',
  });

let rating = [];
// const gcsUri = 'GCS URI of the video to analyze, e.g. gs://my-bucket/my-video.mp4';
const storage = new Storage();
storage
.bucket(bucketName)
.getFiles()
.then(results => {
    const files = results[0];
/*     files.forEach(file => {
        vrate(file.name, function(res){
            console.log(res);
        })
    }) */
    async.everyLimit(files, 3, function(file, callback){
        vrate(file.name, function(rate) {
            console.log(rate);
        })
    })
})
.catch(err => {
    console.error('ERROR:', err);
});
// [END storage_list_files]

function vrate(fname, callback) {
    console.log(fname.slice(0,-4));
    const document = firestore.doc('trailers/'+fname.slice(0,-4));
    const gcsUri = 'gs://spicescale/' + fname;
    //const gcsUri = './myvideo.mp4';
    
    const request = {
        inputUri: gcsUri,
        features: ['EXPLICIT_CONTENT_DETECTION'],
        };
        
        // Human-readable likelihoods
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
            const explicitContentResults = results[0].annotationResults[0].explicitAnnotation;
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
            });

            rating.push({'Trailer':fname},{'UNKNOWN':unknown_s},{'VERY_UNLIKELY':very_unlikely_s},{'UNLIKELY':unlikely_s},{'POSSIBLE':possible_s},{'LIKELY':likely_s},{'VERY_LIKELY':very_likely_s});
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
            /* console.log(rating);
            console.log(unlikely_s); 
            console.log(possible_s);  */
            callback(rating);
        })
        .catch(err => {
            console.error('ERROR:', err);
        });
    };