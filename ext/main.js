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

    setup();

    video.video.addEventListener('play', function() { 
        video.listen('frame');
        $('#id_faces').hide();
        var canvas = document.getElementById('canvas');
        ctx.clearRect(0,0,canvas.width,canvas.height);
        $("#actorslist .panel-body").html('');

    });
    video.video.addEventListener('pause', function() {
        video.stopListen();
        $('#id_faces').show();
    });

    $('.flexslider').flexslider({
        animation: "slide",
        animationLoop: false,
        itemWidth: 100,
        itemMargin: 5,
        pausePlay: false,
    });

    $('#id-faces').click(function() {
        var frameNum = video.get();
        $('#clickedFrame').html('Frame sent: '+frameNum);
        $("#actorslist .panel-body").html('');
        // MAKE MATLAB CALL HERE - send frame, images
        // RECEIVE BBOXES FROM MATLAB

        ctx.clearRect(0,0,canvas.width,canvas.height);

        if (BBOXES.length == 0) {
            $("#actorslist .panel-body").html(MSG_NO_ACTORS);
        }

        $.each(BBOXES, function(i, b) {
            var color = ACTOR_COLORS[i];
            drawBbox(b, color, ctx);
            $("#actorslist .panel-body").append('<p style="color: '+color+'">Actor Name</p>');
        });
    });

    $("#actorslist .panel-body").html(MSG_NO_ACTORS);

    $('.trailer_thumb').click(loadVideo);   
});

// FUNCTIONS
var setup = function() {
    // Load video thumbnails
    $.each(TRAILERS, function(i, trailer) {
        if (i === 0) {
            // First video is default
            $('video source').attr('src', 'videos/' + trailer.file);
            $("video")[0].load();
        }

        $(".slides").append('<li class="trailer_thumb" id="'+i+'"><img src="videos/'+trailer.image+'" /></li>');
    });
}

var loadVideo = function(i) {
    var i = $(this).attr('id');
    var trailer = TRAILERS[i];

    $('video source').attr('src', 'videos/' + trailer.file);
    $("video")[0].load();
};

var drawBbox = function(bbox, color, ctx) {
    var width = bbox.x2 - bbox.x1;
    var height = bbox.y2 - bbox.y1;
    ctx.strokeStyle = color;
    ctx.strokeRect(bbox.x1, bbox.x2, width, height);
};

// OBJECT / VARIABLE DEFINITIONS
var Trailer = function(film, image, file) {
    this.film = film;
    this.image = image;
    this.file = file;
};

var TRAILERS = [
    new Trailer("The Theory of Everything", "theory.jpg", "theory.mp4"),
    new Trailer("Interstellar", "interstellar.jpg", "interstellar.mp4"),
    new Trailer("The Theory of Everything", "theory.jpg", "theory.mp4"),
    new Trailer("Interstellar", "interstellar.jpg", "interstellar.mp4"),
    new Trailer("The Theory of Everything", "theory.jpg", "theory.mp4"),
    new Trailer("Interstellar", "interstellar.jpg", "interstellar.mp4"),
];

var BBOXES = [
    {x1: 0, y1: 0, x2: 20, y2: 30},
    {x1: 60, y1: 70, x2: 140, y2: 200},
    {x1: 340, y1: 100, x2: 400, y2: 200}
];

var MSG_NO_ACTORS = "No actors recognized.";

var ACTOR_COLORS = [
    "rgba(202, 45, 36, 1)", // dark gray blue
    "rgba(168, 61, 70, 1)", // turquoise
    "rgba(46, 68, 94, 1)", // yellow
    "rgba(22, 72, 89, 1)", // orange
    "rgba(7, 67, 87, 1)", // red
];

