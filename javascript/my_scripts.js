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
    $( ".collage_section" ).animate({opacity: 1}, 300);
}


// COLLAGE EDITING

// Manage the coordinates
var mainFrame = {
    get coordinates() {
        return $( ".collage_main_frame" ).position()
    }
}

function coordinatesRelativeToMainFrame(x, y) {
    return {
        left: x - mainFrame.coordinates.left,
        top: y - mainFrame.coordinates.top
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

// Handlers
function handleTouchStart(evt) {
    var left = evt.touches[0].clientX;
    var top = evt.touches[0].clientY;
    swipe.startPoint = coordinatesRelativeToMainFrame(left, top)
}

function handleTouchMove(evt) {
    lastTouch = evt;
}

function handleTouchEnd(evt) {
    var left = lastTouch.touches[0].clientX;
    var top = lastTouch.touches[0].clientY;
    swipe.swipeEnd = coordinatesRelativeToMainFrame(left, top)
}

// Frames
var frames = []

// Initial frame covering the whole collage area
frames[0] = {
    index: 0,
    className: ".collage_frame_" + this.index,
    markup: `<div class="${this.className}"></div>`,
    width: $( ".collage_main_frame" ).width(),
    height: $( ".collage_main_frame" ).height(),
    startPoint: mainFrame.position(),
    swipedThrough: function(swipe) {
        var parallelLineDistance, perpendicularLineDistance;
        if (swipe.direction == "horizontal") {
            parallelLineDistance = swipe.diffX
            perpendicularLineDistance = swipe.diffY
        } else {
            parallelLineDistance = swipe.diffY
            perpendicularLineDistance = swipe.diffX
        }
        // See if the swipe is on the right level
        if (!(this.startPoint.top < swipe.startPoint.top <
                this.startPoint.top + this.height)) {
            return false;
        }
        var swipeLength = swipe.diffX
        var swipeBeginning = this.startPoint.left
        // Take into account only the segment of line that starts on or after
        // the frame
        if (swipe.startPoint.left < this.startPoint.left) {
            swipeLength -= (this.startPoint.left - swipe.startPoint.left);
            swipeBeginning = this.startPoint.left
        }
        // See how far is the beginning of the segment from the end of the frame
        var possibleDistance = this.startPoint.left + this.width - swipeBeginning;
        if (possibleDistance < 0) {
            return false;
        }
        // See how much of this length was covered by the swipe
        var distanceLeftToCover = possibleDistance - swipeLength;
        // See if the swipe went at least 50% through
        if (distanceLeftToCover > 0.5 * this.width) {
            return false;
        } else {
            return true;
        }
    }
}

function RandomColorGen() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return "rgb(" + r + "," + g + "," + b + ")";
}
