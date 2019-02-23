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
    $( ".collage_main_frame" )[0].addEventListener('mousedown', handleTouchStart);
    $( ".collage_main_frame" )[0].addEventListener('mousemove', handleTouchMove);
    $( ".collage_main_frame" )[0].addEventListener('mouseup', handleTouchEnd);

    // Collage already displayed because of media queries
    if($( window ).width() >= 640 && $( window ).height() >= 600) {
        collageSetup();
    }

});


// ANIMATIONS

function hideWelcome() {
    $( ".proceed_button" ).off()
    $( ".welcome_section" ).animate({opacity: 0}, 300, function() {
        $(".welcome_flag").css({opacity: 0, height: "7%", width: "50%", margin: "2.5vh 0 1.5vh 0"});
        $(" .to_slide_down ").css({opacity: 0});
        $( ".side_menu" ).prepend( $(" .to_slide_down "));
        $( ".to_slide_down" ).css({top: "82vh"});
        $(" .to_slide_down ").animate({opacity: 1}, 300);
        $( ".side_menu" ).prepend( $(".welcome_flag") );
        $( ".welcome_section" ).remove();
        $(".welcome_flag").animate({opacity: 1}, 300);
    });

    $( ".button_text" ).animate({opacity: 0}, 300, function() {
        $( ".button_text" ).text("Fair enough");
        $( ".button_text" ).animate({opacity: 1}, 300, function() {
            // Activate the instructions -> collage button
            $( ".proceed_button" ).click(function() {
                hideInstructions();
                setTimeout(function() {
                    showCollage();
                }, 300);
            });
        });
    });
};

function showInstructions() {
    $( ".instructions_section, .side_menu" ).css({display: "flex"});
    $( ".dot_line.down.hor, .proceed_button" ).css({display: "block"});
    $( ".instructions_section, .side_menu, .dot_line.down.hor, .proceed_button" ).animate({opacity: 1});
}

function hideInstructions() {
    $( ".instructions_section, .dot_line.down.hor, .proceed_button" )
    .animate({opacity: 0}, 300, function() {
        $( ".instructions_section, .dot_line.down.hor, .proceed_button, .side_menu" )
        .css("display", "none");
        $( ".collage_section" ).before( $(".welcome_flag") );
    })
}

function hideCollage() {
    $( ".collage_section" ).animate({opacity: 0}, 300, function () {
        $( ".side_menu" ).prepend( $( ".welcome_flag" ));
        $( ".collage_section" ).css("display", "none");
    });
}

function showCollage() {
    $( ".collage_section" ).css("display", "flex");
    $( ".collage_section" ).animate({opacity: 1}, 300, function () {
        if (frameCounter === 0) {
            collageSetup();
        }
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
        this.inputID = "input_" + this.index;
        this.classSelector = "." + this.class;
        this.inputIDSelector = "#" + this.inputID
        this.markup = `<div class="${this.class} collage_frame">`;
        this.inputMarkup = `<input type="file" id="${this.inputID}" accept="image/gif, image/jpeg, image/png"><label for="${this.inputID}">+</label></div>`
        this.width = width;
        this.height = height;
        this.color = randomColorGen();
        this.startPoint = startPoint;
        this.hasPhoto = false;
    }

    get sides() {
        let top = {
            startPoint: this.startPoint,
            endPoint: movePoint(this.startPoint, this.width, "horizontal"),
        }
        let right = {
            startPoint: top.endPoint,
            endPoint: movePoint(top.endPoint, this.height, "vertical"),
        }
        let bottom = {
            startPoint: movePoint(top.startPoint, this.height, "vertical"),
            endPoint: right.endPoint,
        }
        let left = {
            startPoint: this.startPoint,
            endPoint: bottom.startPoint,
        }
        let sides = {
            top: top,
            right: right,
            bottom: bottom,
            left: left,
        }
        return sides;
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
        $( ".collage_main_frame" ).append(this.markup);
        this.update();
        frames[this.index] = this;
        this.appendInput();
    }

    appendInput() {
        $( this.classSelector ).append(this.inputMarkup);
        $( this.inputIDSelector ).change(function (evt) {
            addPhoto(evt);
        });
    }

    delete() {
        $( this.classSelector ).remove();
        delete frames[this.index];
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

    clearPhoto() {
        $( this.classSelector ).children().remove();
        this.hasPhoto = false;
        this.appendInput();
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
var precedingTouch;
var lastSwipeTouch;
var swipe = {
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
    },
    set swipeStart(coordinates) {
        // reset swipe
        lastSwipeTouch = null;
        this.startPoint = coordinates;
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

// Define the main collage frame size depending on a given ratio
function determineMainFrameSize(aspectX, aspectY) {
    let maxWidth, maxHeight;

    // See how much free space there is
    if ($(window).width() < 640 || $(window).height() < 600) {
        // Mobile
        maxWidth = $(window).width() * 0.85;
        maxHeight = $(window).height() * 0.65;
        console.log("git")
    } else {
        // Tablets and bigger
        maxWidth = $(window).width() - 360;
        maxHeight = $(window).height() * 0.75;
    }

    let howManyTimes, newX, newY;
    if (aspectX > aspectY) {
        howManyTimes = Math.floor(maxWidth / aspectX);
        // Make sure the frame fits from both sides
        while (howManyTimes * aspectY > maxHeight) {
            howManyTimes--;
        }
    } else {
        howManyTimes = Math.floor(maxHeight / aspectY);
        while (howManyTimes * aspectX > maxWidth) {
            howManyTimes--;
        }
    }
    return {width: aspectX * howManyTimes,
            height: aspectY * howManyTimes};
}

// Clean the collage
function collageClean() {
    frames = [];
    frameCounter = 0;
    $( ".collage_frame" ).remove();
}

// Handlers
function handleTouchStart(evt) {
    if (precedingTouch) {
        // Detect double tap
        if (Date.now() - precedingTouch.time < 500) {
            // Check which borders were tapped
            let targets = findMergeTargets(precedingTouch);
            // See if they are of equal length
            if (targets) {
                if (mergeValidate(targets)) {
                    merge(targets);
                }
            } else {
                // See if the double tap was on a photo
                 if (tapOnPhotoDetection(precedingTouch)) {
                     tapOnPhotoDetection(precedingTouch).clearPhoto();
                 }
            }
        }
    }
    precedingTouch = {
        time: Date.now(),
    };
    if (evt.touches) {
        // Touch
        precedingTouch.left = evt.touches[0].clientX;
        precedingTouch.top = evt.touches[0].clientY;
        swipe.swipeStart = {
            left: evt.touches[0].clientX,
            top: evt.touches[0].clientY,
        };
    } else {
        // Mouse
        precedingTouch.left = evt.clientX;
        precedingTouch.top = evt.clientY;
        swipe.swipeStart = {
            left: evt.clientX,
            top: evt.clientY,
        };
    }

    if (evt.target.nodeName != "LABEL") {
        evt.preventDefault();
    }
}

function handleTouchMove(evt) {
    lastSwipeTouch = evt;
    evt.preventDefault();
}

function handleTouchEnd(evt) {
    if (lastSwipeTouch) {
        let top, left;
        if (evt.touches) {
            // Touch
            left = lastSwipeTouch.touches[0].clientX;
            top = lastSwipeTouch.touches[0].clientY;
        } else {
            // Mouse
            left = evt.clientX;
            top = evt.clientY;
        }
        swipe.swipeEnd = {
            left: left,
            top: top,
        }
        for (var i = 0; i < frames.length; i++) {
            if (frames[i]) {
                if (frames[i].swipedThrough(swipe)) {
                    frames[i].split(swipe);
                }
            }
        }
    }
    if (evt.target.nodeName != "LABEL") {
        evt.preventDefault();
    }
}


// Photo manipulation
function addPhoto(evt) {
    let element = evt.originalEvent.srcElement;
    let file = element.files[0];
    let img = document.createElement("img");
    let reader = new FileReader();
    reader.onloadend = function() {
         $( img ).css("animation-play-state", "running")
         img.src = reader.result;
         // Remove the spinner
         $( img ).siblings().remove();
    }
    reader.readAsDataURL(file);
    $(element).after(img);
    let loader = `<div class="loader_wrapper"><div class="loader"></div></div>`
    $(element).after(loader);
    frames[findElementsIndex(element)].hasPhoto = true;
    // Remove the file input option
    $(element).siblings("label").remove();
    element.remove();
}

function tapOnPhotoDetection(doubleTapPoint) {
    for (let frame of frames) {
        if (frame && frame.hasPhoto) {
            // Check if the double tap was on that frame
            let onHeight = betweenTheValues(frame.startPoint.top,
                frame.startPoint.top + frame.height, doubleTapPoint.top);
            let onWidth = betweenTheValues(frame.startPoint.left,
                frame.startPoint.left + frame.width, doubleTapPoint.left);
            if (onHeight && onWidth) {
                return frame;
            }
        }
    }
    return false;
}


// Helping functions


function pixelify(num) {
    return num + "px"
}

function randomColorGen() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return "rgba(" + r + "," + g + "," + b + ", 0.4)";
}

function betweenTheValues(min, max, testValue) {
    if (testValue < max && testValue > min) {
        return true;
    }
    return false;
}

function findMergeTargets(doubleTapPoint) {
    let targets = [];
    for (let frame of frames) {
        if (frame) {
            for (let side in frame.sides) {
                if (pointOnLine(frame.sides[side], doubleTapPoint, 10)) {
                    let target = {
                        frame: frame,
                        side: side,
                    };
                    targets.push(target);
                }
            }
        }
    }
    if (targets.length != 2) {
        return false;
    } else {
        return targets;
    }
}

function movePoint(startPoint, length, direction) {
    let endPointTop, endpointLeft;
    if (direction === "horizontal") {
        endPointTop = startPoint.top;
        endpointLeft = startPoint.left + length;
    } else {
        endPointTop = startPoint.top + length;
        endpointLeft = startPoint.left;
    }
    let endPoint = {
        top: endPointTop,
        left: endpointLeft
    }
    return endPoint;
}

function pointOnLine(line, point, tolerance) {
    if (line.startPoint.top == line.endPoint.top) {
        // Horizontal
        if (Math.abs(line.startPoint.top - point.top) > tolerance) {
            return false;
        } else {
            if (betweenTheValues(line.startPoint.left - tolerance,
                    line.endPoint.left + tolerance, point.left)) {
                return true;
            }
        }
    } else {
        // Vertical
        if (Math.abs(line.startPoint.left - point.left) > tolerance) {
            return false;
        } else {
            if (betweenTheValues(line.startPoint.top - tolerance,
                    line.endPoint.top + tolerance, point.top)) {
                return true;
            }
        }
    }
}

function mergeValidate(targets) {
    let firstFrame = targets[0].frame;
    let firstSide = targets[0].side;
    let secondFrame = targets[1].frame;
    let secondSide = targets[1].side;
    // Deep comparison to see if both sides are of equal length
    for (let point in firstFrame.sides[firstSide]) {
        for (let parameter in firstFrame.sides[firstSide][point]) {
            if (!(firstFrame.sides[firstSide][point][parameter]
                    === secondFrame.sides[secondSide][point][parameter])) {
                return false;
            }
        }
    }
    return true;
}

function merge(targets) {
    let firstFrame = targets[0].frame;
    let secondFrame = targets[1].frame;
    let toExpand, toShrink;
    // Always expand from left to right or from top to bottom
    if (targets[0].side === "bottom" || targets[0].side === "right") {
        toExpand = firstFrame;
        toShrink = secondFrame;
    } else {
        toExpand = secondFrame;
        toShrink = firstFrame;
    }

    if (targets[0].side === "bottom" || targets[0].side === "top") {
        toExpand.height += toShrink.height;
    } else {
        toExpand.width += toShrink.width;
    }

    toShrink.delete();
    toExpand.update();
}

function findElementsIndex(markup) {
    let r = /\d+/;
    return markup.outerHTML.match(r)[0];
}
