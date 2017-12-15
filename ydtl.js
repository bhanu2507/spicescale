var fs = require('fs');
var youtubedl = require('youtube-dl');
var video = youtubedl('https://www.youtube.com/watch?v=Ea8jiLRWHNc',
  // Optional arguments passed to youtube-dl.
  ['--format=18'],
  // Additional options can be given for calling `child_process.execFile()`.
  { cwd: __dirname });
 
// Will be called when the download starts.
let fln = '';
/* let url1 = 'https://www.youtube.com/embed/IKsLn5ZLZLY';
let url2 = 'https://www.youtube.com/embed/yUxhHlivzyM'; */
video.on('info', function(info) {
  fln = info._filename;
  console.log('Download started');
  console.log('filename: ' + info._filename);
  console.log('size: ' + info.size);
  video.pipe(fs.createWriteStream('test.mp4'));
});
 
