"use strict";
$(document).ready(function() {

    $( ".proceed_button" ).click(function() {
        hideWelcome();
        setTimeout(function() {
            showInstructions();
        }, 300);
    });

    $( ".instructions_button" ).click(function() {
        hideCollage();
        setTimeout(function() {
            showInstructions();
        }, 300);
    });

    $( ".collage_main_frame" )[0].addEventListener('touchstart', handleTouchStart);
    $( ".collage_main_frame" )[0].addEventListener('touchmove', handleTouchMove);
    $( ".collage_main_frame" )[0].addEventListener('touchend', handleTouchEnd);

});


// ANIMATIONS

function hideWelcome() {
    $( ".main_section" ).animate({opacity: 0}, 300, function() {
        $( ".main_section" ).remove();
    });

    // Prepare to show the instructions
    $( ".to_slide_down" ).addClass( "slide_down" );
    $( ".to_shrink" ).addClass( "shrink" );

    $( ".button_text" ).animate({opacity: 0}, 200, function() {
        $( ".button_text" ).text("Fair enough");
        $( ".button_text" ).animate({opacity: 1}, 200, function() {

            // Activate the instructions -> collage button
            $( ".proceed_button" ).off().click(function() {
                hideInstructions();
                setTimeout(function() {
                    showCollage();
                }, 300);

            });
        });
    });
};

function showInstructions() {

    $( ".instructions_section" ).css({opacity: 1, display: "block"});
    $( ".proceed_button" ).css("display", "block");

    $( ".to_show" ).css("opacity", "0");

    $( ".to_show" ).css("display", "block");
    $( ".to_show_flex" ).css("display", "flex");


    var elementsToShow = $( ".to_show" )

    // Gradually show the instruction steps
    var elementsSequence = [
        [elementsToShow[2]],
        [elementsToShow[0], elementsToShow[1], elementsToShow[3]],
        [elementsToShow[4], elementsToShow[5]],
        [elementsToShow[6], elementsToShow[7], elementsToShow[8], elementsToShow[9]],
        [elementsToShow[10], elementsToShow[11]],
        [$( ".proceed_button" )]
    ]

    for (let i = 0; i < elementsSequence.length; i++) {
        for (let j = 0; j < elementsSequence[i].length; j++) {
            setTimeout(() => {
                $(elementsSequence[i][j]).animate({opacity: 1}, 300)
            }, i * 50)
        }
    }
}

function hideInstructions() {
    $( ".instructions_section, .dot_line.down.hor, .proceed_button" )
    .animate({opacity: 0}, 300, function() {
        $( ".instructions_section, .dot_line.down.hor, .proceed_button" )
        .css("display", "none");
    })
}

function hideCollage() {
    $( ".collage_section" ).animate({opacity: 0}, 300, function () {
        $( ".collage_section" ).css("display", "none");
    });
}

function showCollage() {
    $( ".collage_section" ).css("display", "flex");
    $( ".collage_section" ).animate({opacity: 1}, 300, function () {
        collageSetup();
    });
}


// COLLAGE EDITING

// Set the inital variables
var mainFrame;
var frames = [];
var frameCounter = 0;

// Collage classes
class Frame {
    constructor(width, height, startPoint) {
        this.index = frameCounter;
        frameCounter++;
        this.class = "collage_frame_" + this.index;
        this.classSelector = "." + this.class;
        this.markup = `<div class="${this.class}"></div>`;
        this.width = width;
        this.height = height;
        this.color = RandomColorGen();
        this.startPoint = startPoint;
    }

    update() {
        $( this.classSelector ).css({
            "position": "relative",
            "width": pixelify(this.width),
            "height": pixelify(this.height),
            "backgroundColor": this.color,
        });
    }

    append() {
        $( ".collage_main_frame" ).append(this.markup)
        this.update();
        frames[this.index] = this;
    }

    swipedThrough(swipe) {
        if (swipe.direction == "horizontal") {
            var swipeLength = swipe.diffX
            var swipePerpendicularLevel = swipe.startPoint.top;
            var swipeParallelLevel = swipe.startPoint.left;
            var framePerpendicularLevel = this.startPoint.top;
            var framePerpendicularLength = this.height;
            var frameParallelLevel = this.startPoint.left;
            var frameParallelLength = this.width;
        } else if (swipe.direction == "vertical") {
            var swipeLength = swipe.diffY
            var swipePerpendicularLevel = swipe.startPoint.left;
            var swipeParallelLevel = swipe.startPoint.top;
            var framePerpendicularLevel = this.startPoint.left;
            var framePerpendicularLength = this.width;
            var frameParallelLevel = this.startPoint.top;
            var frameParallelLength = this.height;
        }
        // See if the swipe is on the right level
        if (!(framePerpendicularLevel < swipePerpendicularLevel &&
                swipePerpendicularLevel <
                (framePerpendicularLevel + framePerpendicularLength))) {
            return false;
        }
        var swipeCountingBeginning = swipeParallelLevel;
        // Take into account only the segment of line that starts on or after
        // the frame
        if (swipeParallelLevel < frameParallelLevel) {
            swipeLength -= (frameParallelLevel - swipeParallelLevel);
            swipeCountingBeginning = frameParallelLevel;
        }
        // See how far is the beginning of the swipe segment from the end of the frame
        var possibleDistance = frameParallelLevel + frameParallelLength
                - swipeCountingBeginning;
        if (possibleDistance < 0) {
            return false;
        }
        // See how much of this length was covered by the swipe
        var distanceLeftToCover = possibleDistance - swipeLength;
        var distanceCovered = possibleDistance - distanceLeftToCover;
        // See if the swipe went at least 50% through
        if (distanceCovered < 0.5 * frameParallelLength) {
            return false;
        } else {
            return true;
        }
    }

    cut(swipe) {
        if (swipe.direction == "horizontal") {
            this.height = swipe.startPoint.top - this.startPoint.top;
        } else {
            this.width = swipe.startPoint.left - this.startPoint.left;
        }
        this.update();
    }
}

// Collect the data about swipe
var lastTouch = null;
var swipe = {
    startPoint: {
        left: null,
        top: null,
    },
    // Add the information about the driection and the end point
    set swipeEnd(coordinates) {
        this.endPoint = coordinates;
        this.diffX = Math.abs(this.startPoint.left - this.endPoint.left);
        this.diffY = Math.abs(this.startPoint.top - this.endPoint.top);
        if (this.diffX > this.diffY) {
            this.direction = "horizontal";
        } else {
            this.direction = "vertical";
        }
    }
}

// Prepare the collage section
function collageSetup() {
    let mainFrame = {width: $( ".collage_main_frame" ).width(),
            height: $( ".collage_main_frame" ).height(),
            startPoint: $( ".collage_main_frame" ).position()};

    // Initial frame covering the whole collage area
    let firstFrame = new Frame ($( ".collage_main_frame" ).width(),
            $( ".collage_main_frame" ).height(),
            $( ".collage_main_frame" ).position())
    firstFrame.append()
}


// Handlers
function handleTouchStart(evt) {
    var left = evt.touches[0].clientX;
    var top = evt.touches[0].clientY;
    swipe.startPoint = {
        left: left,
        top: top,
    }
}

function handleTouchMove(evt) {
    lastTouch = evt;
}

function handleTouchEnd(evt) {
    var left = lastTouch.touches[0].clientX;
    var top = lastTouch.touches[0].clientY;
    swipe.swipeEnd = {
        left: left,
        top: top,
    }
    for (var i = 0; i < frames.length; i++) {
        if (frames[i].swipedThrough(swipe)) {
            frames[i].cut(swipe);
        }
    }
}


// Helping functions

function pixelify(num) {
    return num + "px"
}

function RandomColorGen() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return "rgb(" + r + "," + g + "," + b + ")";
}
