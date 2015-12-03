$(document).ready(function() {
    var currentFrame = $('#currentFrame');
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var video = VideoFrame({
        id : 'video',
        frameRate: 24,
        callback : function(frame) {
            currentFrame.html(frame);
        }
    });

    video.video.addEventListener('play', function() { 
        video.listen('frame');
        $('#id_faces').hide();
        var canvas = document.getElementById('canvas');
        ctx.clearRect(0,0,canvas.width,canvas.height);
    });
    video.video.addEventListener('pause', function() {
        video.stopListen();
        $('#id_faces').show();
    });

    loadVideoThumbnails(TRAILERS);

    $('.flexslider').flexslider({
        animation: "slide",
        animationLoop: false,
        itemWidth: 210,
        itemMargin: 5,
        pausePlay: false,
    });

    $('#id_faces').click(function() {
        console.log('hello');
        var frameNum = video.get();
        $('#clickedFrame').html('Frame sent: '+frameNum);
        // MAKE MATLAB CALL HERE - send frame, images
        // RECEIVE BBOXES FROM MATLAB

        console.log('draw box');
        ctx.clearRect(0,0,canvas.width,canvas.height);
        $.each(BBOXES, function(i, b) {
            drawBbox(b, ctx);
        });
    });

    $('.trailer_thumb').click(loadVideo);
});

// FUNCTIONS
var loadVideoThumbnails = function(trailers) {    
    $.each(trailers, function(i, trailer) {
      $(".slides").append('<li class="trailer_thumb" id="'+i+'"><img src="'+trailer.image+'" /></li>');
    });
};

var loadVideo = function() {
    var i = $(this).attr('id');
    var trailer = TRAILERS[i];

    $('video source').attr('src', 'videos/' + trailer.file);
    $("video")[0].load();
};

var drawBbox = function(bbox, ctx) {
    var width = bbox.x2 - bbox.x1;
    var height = bbox.y2 - bbox.y1;
    ctx.strokeStyle = "red";
    ctx.strokeRect(bbox.x1, bbox.x2, width, height);
};

// OBJECT / VARIABLE DEFINITIONS
var Trailer = function(film, image, file) {
    this.film = film;
    this.image = image;
    this.file = file;
};

var TRAILERS = [
    new Trailer("The Theory of Everything", "camouflauge.jpg", "theory.mp4"),
    new Trailer("The Bourne Legacy", "camouflauge.jpg", "legacy.mp4"),
];

var BBOXES = [
    {x1: 0, y1: 0, x2: 20, y2: 30},
    {x1: 60, y1: 70, x2: 140, y2: 200},
    {x1: 340, y1: 100, x2: 400, y2: 200}
];


