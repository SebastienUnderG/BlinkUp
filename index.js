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

    update();
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

  function update(){
    
    imagectx.drawImage(video, 0, 0,video.videoWidth, video.videoHeight, 0,0,imageCanvas.width,imageCanvas.height);
    var color = average(imagectx.getImageData(0,0,imageCanvas.width,imageCanvas.height));

    var cur;

    if(color.r > 200 && color.g > 200 && color.b > 200){
      cur = 'white'
    } else if(color.r > 200){
      cur = 'red'
    } else if(color.b > 200) {
      cur = 'blue'
    }

    if(cur && cur != previous) {
      listeners.forEach(function(l){
        l(cur);
      });
      previous = cur
    }

    window.requestAnimationFrame(update);
  }
}

document.addEventListener("DOMContentLoaded", function() {
  var cr = new ColorReader();

  var all = [];

  cr.onChange(function(a){
    console.log(a);

    var colors = ['red', 'blue']

    if(a != 'white')
      all.push(colors.indexOf(a))


    var res = _.last(all, 11);
    if(res.length == 11){
      var result = res.join("");
      var parsed = parseInt(result , 2 );
      console.log("Received", parsed);
    }
  })
});