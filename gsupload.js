const Storage = require('@google-cloud/storage');
const Firestore = require('@google-cloud/firestore');
const video = require('@google-cloud/video-intelligence').v1;
const client = new video.VideoIntelligenceServiceClient();

const firestore = new Firestore({
  projectId: 'spicescale-291ce',
  keyFilename: './spicescale-0309023d13b5.json',
});
const fs = require('fs');
const bucketName = 'spicescale';

/* fs.readdir('./trailers', (err, files) => {
  files.forEach(file => {
    console.log(file);
    const storage = new Storage();
    storage
    .bucket(bucketName)
    .upload('./trailers/'+file)
    .then(() => {
      console.log(`${file} uploaded to ${bucketName}.`);
      fs.unlinkSync('./trailers/' + file);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
    
  })
}) */

const storage = new Storage();
const gcsUri = '12-15-2017-17-54-50.mp4';
storage
  .bucket(bucketName)
  .file(gcsUri)
  .delete()
  .then(() => {
  console.log(`gs://${bucketName}/${gcsUri} deleted.`);
  }) 
  .catch(err => {
  console.error('ERROR:', err);
  });


//const filename = './Malli_Raava_theatrical_trailer_-_idlebrain.com-ByOnLtxjFHs.mp4';

//const storage = new Storage();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const bucketName = 'Name of a bucket, e.g. my-bucket';
  // const filename = 'Local file to upload, e.g. ./local/path/to/file.txt';

  // Uploads a local file to the bucket
/*   storage
    .bucket(bucketName)
    .upload(filename)
    .then(() => {
      console.log(`${filename} uploaded to ${bucketName}.`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    }); */
  // [END storage_upload_file]
