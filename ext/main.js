var video, canvas, ctx;
$(document).ready(function() {
    // SET UP GLOBAL VARIABLES
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    loadVideo(0); // Load first video as default
    loadVideoThumbnails();

    // Play/pause event listeners for video
    video.video.addEventListener('play', function() { 
        video.listen('frame');
        $('#id-faces').hide();
        $('#actorslist').hide();
        resetActors();
    });
    video.video.addEventListener('pause', function() {
        video.stopListen();
        $('#actorslist').show();
        $('#id-faces').show();
    });

    // Add video thumbnail slider
    $('.flexslider').flexslider({
        animation: "slide",
        animationLoop: false,
        itemWidth: 110,
        itemMargin: 5,
        pausePlay: false,
    });

    // ID faces - grabs bboxes for that frame
    $('#id-faces').click(function() {
        resetActors();
        var trailer = TRAILERS[$('video').attr('id')];

        $.ajax({
            url: trailer.bboxJson,
            dataType: "jsonp",
            async: false,
            success: parseDataBboxes
        });
    });

    // Actors list and trailer thumbnails listeners
    $("#actorslist .panel-body").html(MSG_NO_ACTORS);
    $('.trailer_thumb').click(function() {
        var i = $(this).attr('id');
        loadVideo(i);
    });   
});

// FUNCTIONS
var loadVideoThumbnails = function() {
    // Load video thumbnails
    $.each(TRAILERS, function(i, trailer) {
        $(".slides").append('<li class="trailer_thumb" id="'+i+'"><img src="videos/'+trailer.image+'" /></li>');
    });
}

var parseDataBboxes = function(bboxData) {
    var frameNum = video.get() + 1;
    $('#clickedFrame').html('Frame sent: '+frameNum);
    console.log('clickedFrame:', frameNum);

    var frameData = bboxData[frameNum];
    if (frameData === "0") {
        $("#actorslist .panel-body").html(MSG_NO_ACTORS);
        console.log(frameNum, ': no actors found');
    } else {
        var bboxes = frameData.split('|');
        bboxes = bboxes.slice(1, bboxes.length);
        var seenActors = [];

        $.each(bboxes, function(i, b) {
            console.log(frameNum, ": ", b);
            var data = b.split('*').map(function(item) { return parseInt(item); });
            var actorNum = data[0];
            if ($.inArray(actorNum, seenActors) < 0) {
                var color = ACTOR_COLORS[actorNum];
                var actorName = bboxData.actors[actorNum]
                console.log(color);
                console.log(data.slice(2, data.length));
                drawBbox(data.slice(2, data.length), color, ctx);

                $("#actorslist .panel-body").append('<p style="color: '+color+'">'+actorName+'</p>');
                seenActors.push(actorNum);
            }
        });
    }
}

var loadVideo = function(i) {
    var trailer = TRAILERS[i];

    video = VideoFrame({
        id: 'video',
        frameRate: trailer.fps,
        callback : function(frame) {
            // currentFrame.html(frame);
        }
    }); 

    $('video source').attr('src', 'videos/' + trailer.file);
    $('video').attr('id', i);
    $("video")[0].load();    
};

var drawBbox = function(bbox, color, ctx) {
    var y1 = bbox[0]; 
    var y2 = bbox[1];
    var x1 = bbox[2];
    var x2 = bbox[3];

    var width = (x2-x1) * FRAME_RATIO;
    var height = (y2-y1) * FRAME_RATIO;
    ctx.strokeStyle = color;
    ctx.strokeRect(x1*FRAME_RATIO, y1*FRAME_RATIO, width, height);
};

var resetActors = function() {
    $("#actorslist .panel-body").html('');
    ctx.clearRect(0,0,canvas.width,canvas.height);
};

// OBJECT / VARIABLE DEFINITIONS
var Trailer = function(film, image, file, fps, bboxJson) {
    this.film = film;
    this.image = image;
    this.file = file;
    this.fps = fps;
    this.bboxJson = "http://jenshen.scripts.mit.edu/whosthatactor/" + bboxJson;
};

var TRAILERS = [
    new Trailer("The Imitation Game", "imitation_game.jpg", "imitation_game.mp4", 24.0, "imitation_game_bboxes.json"),
    new Trailer("The Theory of Everything", "theory.jpg", "theory.mp4", 25.0, "theory_bboxes.json"),
    new Trailer("Interstellar", "interstellar.jpg", "interstellar.mp4", 24.0, "interstellar_bboxes.json"),
    new Trailer("Brooklyn", "brooklyn.png", "brooklyn.mp4", 24.0, "brooklyn_bboxes.json"),
    new Trailer("Inception", "inception.jpg", "inception.mp4", 24.0, "inception_bboxes.json"),
];

var MSG_NO_ACTORS = "No actors recognized.";

var ACTOR_COLORS = [
    "rgba(26, 188, 156,1.0)", // turquoise
    "rgba(46, 204, 113,1.0)", // green
    "rgba(52, 152, 219,1.0)", // blue
    "rgba(241, 196, 15,1.0)", // yellow
    "rgba(243, 156, 18,1.0)", // yellow-orange
    "rgba(211, 84, 0,1.0)", // orange
    "rgba(231, 76, 60,1.0)", // coral
    "rgba(192, 57, 43,1.0)", // red
    "rgba(155, 89, 182,1.0)", // light purple
    "rgba(142, 68, 173,1.0)" // purple
];

var OUR_FRAME_WIDTH = 405.0;
var VIDEO_FRAME_WIDTH = 720.0;
var FRAME_RATIO = OUR_FRAME_WIDTH/VIDEO_FRAME_WIDTH;