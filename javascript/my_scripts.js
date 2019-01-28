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
    $( ".collage_section" ).animate({opacity: 1}, 300, function() {
        getCollageFramePosition();
    });
}


// COLLAGE EDITING

var firstTouch = null;
var lastTouch = null;

var framePostion = null;

var splitCounter = 0;

var splitLines = [];

function getTouches(evt) {
  return evt.touches;
}

function handleTouchStart(evt) {
    firstTouch = evt;
}

function handleTouchMove(evt) {
    lastTouch = evt;
}

function handleTouchEnd(evt) {
    if (lastTouch && framePostion) {
        var firstX = firstTouch.touches[0].clientX - framePostion.left;
        var firstY = firstTouch.touches[0].clientY - framePostion.top;

        var lastX = lastTouch.touches[0].clientX - framePostion.left;
        var lastY = lastTouch.touches[0].clientY - framePostion.top;

        diffX = firstX - lastX;
        diffY = firstY - lastY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            console.log("horizontal")
        } else {
            if (splitLines.length == 0) {
                initialCollageSplitVertical(firstX)
            } else {
                verticalSplit(firstX)
            }
        }
    }

    // reset values
    firstTouch = null;
    lastTouch = null;
};

function getCollageFramePosition() {
    framePostion = $( ".collage_main_frame" ).position()
}

function initialCollageSplitVertical(coordinateX) {

    var splitLine = {
        direction: "vertical",
        coordinate: coordinateX,
        leftFrameNumber: splitCounter + 1,
        rightFrameNumber: splitCounter + 2
    }
    splitLines.push(splitLine);

    for (var i = 0; i < 2; i++) {
        splitCounter++;
        var markup = `
        <div class="collage_frame_${splitCounter}"></div>
        `
        $( ".collage_main_frame" ).append(markup);
        var className = ".collage_frame_" + splitCounter;

        // Adjust the size with the right proportions
        if (i == 1) {
            frameWidth = $( ".collage_main_frame" ).width() - coordinateX + "px";
        } else {
            frameWidth = coordinateX + "px";
        }
        $( className ).css({
            width: frameWidth,
            height: "100%",
            backgroundColor: colorGen()
        })
    }
}

function verticalSplit(coordinateX) {
    // Find the right frame to split
    var frameToSplit = {
        frameNumber: null,
        distance: null,
        splitLineIndex: null
    };
    var lastFrame = {
        frameNumber: null,
        distance: null,
        splitLineIndex: null
    };
    var splitToTheRight = false;
    // Find the closest splitting line on the right. If not, get the last one
    for (var i = 0; i < splitLines.length; i++) {
        var distanceFromXToSplit = coordinateX - splitLines[i].coordinate;
        if (distanceFromXToSplit < 0 && (Math.abs(distanceFromXToSplit) < frameToSplit.distance || frameToSplit.distance === null)) {
            frameToSplit.frameNumber = splitLines[i].leftFrameNumber;
            frameToSplit.distance = Math.abs(distanceFromXToSplit);
            frameToSplit.splitLineIndex = i;
        } else if (distanceFromXToSplit > 0 && (distanceFromXToSplit < lastFrame.distance || lastFrame.distance === null)) {
            lastFrame.distance = distanceFromXToSplit;
            lastFrame.frameNumber = splitLines[i].rightFrameNumber;
            lastFrame.splitLineIndex = i;
        }
    }
    if (frameToSplit.frameNumber === null) {
        frameToSplit = lastFrame;
        splitToTheRight = true;
    }

    // Make space for the new slot
    var classNameToSplit = ".collage_frame_" + frameToSplit.frameNumber;
    var newWidth = $( classNameToSplit ).width() - frameToSplit.distance;
    $( classNameToSplit ).css("width", newWidth);
    // console.log(frameToSplit.frameNumber)

    // Append the new slot between the splitting line and slot on left
    // Or right, if it is after the last splitting line
    splitCounter++;
    var markup = `
    <div class="collage_frame_${splitCounter}"></div>
    `

    if (splitToTheRight) {
        $( classNameToSplit ).before(markup);
    } else {
        $( classNameToSplit ).after(markup);
    }

    var classNameToAppend = ".collage_frame_" + splitCounter;
    $( classNameToAppend ).css({
        width: frameToSplit.distance + "px",
        height: "100%",
        backgroundColor: colorGen()
    });

    // Add the new splitline
    if (splitToTheRight) {
        var splitLine = {
            direction: "vertical",
            coordinate: coordinateX,
            leftFrameNumber: splitCounter,
            rightFrameNumber: frameToSplit.frameNumber,
        }
    } else {
        var splitLine = {
            direction: "vertical",
            coordinate: coordinateX,
            leftFrameNumber: frameToSplit.frameNumber,
            rightFrameNumber: splitCounter,
        }
    }
    splitLines.push(splitLine);

    // Update the neighbors
    if (splitToTheRight) {
        splitLines[frameToSplit.splitLineIndex].rightFrameNumber = splitCounter;
    } else {
        splitLines[frameToSplit.splitLineIndex].leftFrameNumber = splitCounter;
    }
}

function colorGen() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return "rgb(" + r + "," + g + "," + b + ")";
}

// frames = [] {
// 	index
// 	markup
// 	width
// 	height
// 	startPointX
// 	startPointY
// 	swipedThroughMe(swipe) {
// 		determine if the swipe event goes through the frame
// 	}
// 	split(direction, howMuchToCut) {
// 		make the frame shorter
// 	}
// 	append(where) {
// 		insert the markup and style
// 	}
// }
//
// splitLines = [] {
// 	index
// 	startingPoint
// 	length
// 	direction
// 	distanceToTap(location) {
// 		return the index and the distance between tap and line
// 	}
// }
//
// onSwipe(swipeEvent) {
// 	swipe = {
// 		startPoint
// 		endPoint
// 		direction
// 	}
// 	split(swipe)
// }
//
// split(swipe) (
// 	for frame in frames
// 		if frame.swipedThroughMe(swipe)
// 			frame.split(direction, howMuchToCut)
// 	create a new frame
// 	frame.append
// )
//
// onDoubleTap(location) {
// 	for splitLine in splitLines
// 		collect all distanceToTap
// 	choose the smallest distanceToTap
//
// }
