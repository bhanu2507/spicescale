/**
* Copyright 2017, Google, Inc.
* Licensed under the Apache License, Version 2.0 (the `License`);
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an `AS IS` BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

'use strict';

 // [START analyze_faces]
 // Imports the Google Cloud Video Intelligence library
 const video = require('@google-cloud/video-intelligence').v1;

 // Creates a client
 const client = new video.VideoIntelligenceServiceClient();

 /**
  * TODO(developer): Uncomment the following line before running the sample.
  */
 // const gcsUri = 'GCS URI of the video to analyze, e.g. gs://my-bucket/my-video.mp4';
 const gcsUri = 'gs://spicescale/HOwrah Bridge.mp4';
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
      console.log('Waiting for operation to complete...');
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
      });
      rating.push({'UNKNOWN':unknown},{'VERY_UNLIKELY':very_unlikely},{'UNLIKELY':unlikely},{'POSSIBLE':possible},{'LIKELY':likely},{'VERY_LIKELY':very_likely});
      console.log(rating);
      console.log(unlikely_s); 
      console.log(possible_s); 
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
   