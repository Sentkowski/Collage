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
        this.color = randomColorGen();
        this.startPoint = startPoint;
    }

    update() {
        $( this.classSelector ).css({
            "position": "absolute",
            "width": pixelify(this.width),
            "height": pixelify(this.height),
            "top": this.startPoint.top,
            "left": this.startPoint.left,
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

            // 1. Make sure that swipe was on the right height
            if (!betweenTheValues(this.startPoint.top,
            this.startPoint.top + this.height, swipe.startPoint.top)) {
                return false;
            }

            // 2. Choose from the beginning and end swipe points the closest one to
            // to left and take it as swipe beginning
            let swipeBeginning = (swipe.startPoint.left < swipe.endPoint.left)
                    ? swipe.startPoint : swipe.endPoint;

            // 3. If the swipe beginning is before the frame, move it at the cost
            // of swipe length
            let swipeLength = swipe.diffX;
            if (swipeBeginning.left < this.startPoint.left) {
                swipeLength -= this.startPoint.left - swipeBeginning.left;
            }

            // 4. If the swipe exceds the frame, count out the surplus
            if (swipeBeginning.left + swipeLength >
                    this.startPoint.left + this.width) {
                swipeLength = (this.startPoint.left + this.width) - swipeBeginning.left;
            }

            // 5. See if the swipe covers more than 50% of frame's length
            if (swipeLength > this.width * 0.5) {
                return true;
            } else {
                return false;
            }

        } else if (swipe.direction == "vertical") {
            // Do the same procedure, only with different variables (e.g. width -> height)
            // 1.
            if (!betweenTheValues(this.startPoint.left,
            this.startPoint.left + this.width, swipe.startPoint.left)) {
                return false;
            }

            // 2.
            let swipeBeginning = (swipe.startPoint.top < swipe.endPoint.top)
                    ? swipe.startPoint : swipe.endPoint;

            // 3.
            let swipeLength = swipe.diffY;
            if (swipeBeginning.top < this.startPoint.top) {
                swipeLength -= this.startPoint.top - swipeBeginning.top;
            }

            // 4.
            if (swipeBeginning.top + swipeLength >
                    this.startPoint.top + this.height) {
                swipeLength = (this.startPoint.top + this.height) - swipeBeginning.top;
            }

            // 5.
            if (swipeLength > this.height * 0.5) {
                return true;
            } else {
                return false;
            }
        }
    }

    split(swipe) {
        let newFrameWidth, newFrameHeight, newFrameStart;
        if (swipe.direction == "horizontal") {
            newFrameHeight = this.startPoint.top + this.height - swipe.startPoint.top;
            this.height = swipe.startPoint.top - this.startPoint.top;
            newFrameStart = {
                top: this.startPoint.top + this.height,
                left: this.startPoint.left
            };
            newFrameWidth = this.width;
        } else {
            newFrameWidth = this.startPoint.left + this.width - swipe.startPoint.left;
            this.width = swipe.startPoint.left - this.startPoint.left;
            newFrameStart = {
                top: this.startPoint.top,
                left: this.startPoint.left + this.width
            };
            newFrameHeight = this.height;
        }
        this.update();
        new Frame(newFrameWidth, newFrameHeight, newFrameStart).append();
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
    lastTouch = null;
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
    if (lastTouch) {
        var left = lastTouch.touches[0].clientX;
        var top = lastTouch.touches[0].clientY;
        swipe.swipeEnd = {
            left: left,
            top: top,
        }
        for (var i = 0; i < frames.length; i++) {
            if (frames[i].swipedThrough(swipe)) {
                frames[i].split(swipe);
            }
        }
    }
}


// Helping functions

function pixelify(num) {
    return num + "px"
}

function randomColorGen() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return "rgb(" + r + "," + g + "," + b + ")";
}

function bindAccordingToDirection(direction, horAlternatives, vertAlternatives) {
    if (direction == "horizontal") {
        return horAlternatives;
    } else {
        return vertAlternatives;
    }
}

function betweenTheValues(min, max, testValue) {
    if (testValue < max && testValue > min) {
        return true;
    }
    return false;
}
