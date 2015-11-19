function ColorReader() {

  navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  window.requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

  if(!navigator.getUserMedia){
    throw Exception("getUserMedia is not supported")    
  }

  var w=560;
  var h=315;
  var previous;
  var imageCanvas = document.getElementById( 'image-canvas' );
  var results = document.getElementById('results');
  var imagectx = imageCanvas.getContext('2d');
  
  
  var video = document.createElement('video');
  video.autoplay='autoplay';
  video.width=w;
  video.height=h;
  var constraints =  {'video':true};
  if(navigator.webkitGetUserMedia){
   constraints =  {
        video: {
          mandatory: {
            maxWidth: w,
            maxHeight: h
          }
        }
      };
    }

  navigator.getUserMedia(
    constraints,
    function(stream) {
    video.src = window.URL.createObjectURL(stream);
    // onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
    vidReady = setInterval(function(){
      if(video.videoHeight !== 0){
        clearInterval(vidReady);
        init();
      }
    },100)
  }, console.error);

  function init()
  {
    imageCanvas.height = video.videoHeight;
    imageCanvas.width = video.videoWidth;
  }

  function average(imgData) {
    var d = imgData.data;
    var rgb ={r:0,g:0,b:0};
    for (var i=0; i<d.length; i+=4) {
      rgb.r += d[i];
      rgb.g += d[i+1];
      rgb.b += d[i+2];
    }

    rgb.r = ~~(rgb.r/(d.length/4));
    rgb.g = ~~(rgb.g/(d.length/4));
    rgb.b = ~~(rgb.b/(d.length/4));

    return rgb;
  };

  var listeners = [];

  this.onChange = function(listener) {
    listeners.push(listener);
  }

  this.unsubscribe = function(){
    listeners = [];
  }

  this.start = function(){
    update();
  }

  var nc = nearestColor.from({red: '#f00', white: '#ffF', blue: '#00f'});

  function update(){
    
    imagectx.drawImage(video, 0, 0,video.videoWidth, video.videoHeight, 0,0,imageCanvas.width,imageCanvas.height);
    var color = average(imagectx.getImageData(0,0,imageCanvas.width,imageCanvas.height));

    var cur = nc(color).name;

    if(cur && cur != previous) {
      if((cur == 'blue' || cur == 'red') && previous == 'white')
      {
        listeners.forEach(function(l){
          l(cur);
        });
      }
      previous = cur
    }

    window.requestAnimationFrame(update);
  }
}

function log(text)
{
  var li = document.createElement('li');
  li.appendChild(document.createTextNode(text));

  results.appendChild(li);
}

function clearLog()
{
  results.innerHTML = '';  
}

var cd;

function start()
{
  clearLog();

  if(cd != undefined && cd.cr != undefined)
    cd.cr.unsubscribe();

  cd = new ColorDecoder();
}

function ColorDecoder() {
  var cr = new ColorReader();

  var all = [];

  cr.onChange(function(a){
    var colors = ['red', 'blue']

    log(a);

    all.push(colors.indexOf(a));


    if(all.length == 16){
      var result = all.join("");
      var parsed = parseInt(result , 2 );
      log(parsed);

      cr.unsubscribe();
    }
  });

  cr.start();
}