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

    appendFrameHandlers();
    $( window ).resize( function () {
        if ($( ".collage_main_frame" ).width() >= $( ".collage_section" ).width()) {
            $( ".collage_main_frame" ).css("alignSelf", "flex-start");
        } else {
            $( ".collage_main_frame" ).css("alignSelf", "center");
        }
    });

    $( ".aspect_numbers" )[0].addEventListener('change', handleAspectChange);
    $( ".reset_button" )[0].addEventListener('click', handleReset);
    $( ".create_button" )[0].addEventListener('click', handleCreate);
    $( ".back_button" )[0].addEventListener('click', handleBack);
    $( ".download_button" )[0].addEventListener('click', collageDownload);

    // Collage already displayed because of media queries
    if($( window ).width() >= 640 && $( window ).height() >= 600) {
        findBiggestSize();
        setTimeout(function () {
            handleAspectChange();
        }, 50);
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
    findBiggestSize();
    $( ".collage_section" ).animate({opacity: 1}, 300, function () {
        if (frameCounter === 0) {
            findBiggestSize();
            handleAspectChange();
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
    constructor(width, height) {
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
        this.hasPhoto = false;
    }

    get startPoint() {
        return {
            top: Math.round($( this.classSelector ).position().top) + Math.round($( ".collage_main_frame" ).position().top),
            left: Math.round($( this.classSelector ).position().left) + Math.round($( ".collage_main_frame" ).position().left),
        }
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
            "backgroundColor": this.color,
        });
    }

    append(startPoint) {
        $( ".collage_main_frame" ).append(this.markup);
        this.update();
        frames[this.index] = this;
        this.appendInput();
        $( this.classSelector ).css({
            "top": Math.round(startPoint.top) - Math.round($( ".collage_main_frame" ).offset().top),
            "left": Math.round(startPoint.left) - Math.round($( ".collage_main_frame" ).offset().left),
        });
    }

    appendInput() {
        $( this.classSelector ).append(this.inputMarkup);
        $( this.classSelector ).children().animate({opacity: 1}, 300, () => {
            $( this.inputIDSelector ).change(function (evt) {
                addPhoto(evt);
            });
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
        removeFrameHandlers();
        $( this.classSelector ).children().css({opacity: 1});
        $( this.classSelector ).children().animate({opacity: 0}, 300, () => {
            $( this.classSelector ).children().remove();
            this.hasPhoto = false;
            this.appendInput();
            appendFrameHandlers();
        });
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
        new Frame(newFrameWidth, newFrameHeight).append(newFrameStart);
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
        if (coordinates === 0) {
            this.startPoint = null;
        } else {
            this.startPoint = coordinates;
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
            $( ".collage_main_frame" ).height())
    firstFrame.append($( ".collage_main_frame" ).position())
}

// Define the main collage frame size depending on a given ratio
function determineMainFrameSize(aspectX, aspectY) {
    let maxWidth, maxHeight;

    // See how much free space there is
    if ($(window).width() < 640 || $(window).height() < 600) {
        // Mobile
        maxWidth = $(window).width() * 0.85;
        maxHeight = $(window).height() * 0.60;
    } else {
        // Tablets and bigger
        maxWidth = $(window).width() - 380;
        maxHeight = $(window).height() * 0.75;
    }
    let howManyTimes, newX, newY;
    if (aspectX > aspectY) {
        howManyTimes = Math.floor(maxWidth / aspectX);
        // Make sure the frame fits from both sides
        while ((howManyTimes * aspectY) > maxHeight) {
            howManyTimes--;
        }
    } else {
        howManyTimes = Math.floor(maxHeight / aspectY);
        while (howManyTimes * aspectX > maxWidth) {
            howManyTimes--;
        }
    }
    $($("h2")[1]).text(maxHeight);
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

function appendFrameHandlers() {
    $( ".collage_main_frame" )[0].addEventListener('touchstart', handleTouchStart);
    $( ".collage_main_frame" )[0].addEventListener('touchmove', handleTouchMove);
    $( ".collage_main_frame" )[0].addEventListener('touchend', handleTouchEnd);
    $( ".collage_main_frame" )[0].addEventListener('mousedown', handleTouchStart);
    $( ".collage_main_frame" )[0].addEventListener('mousemove', handleTouchMove);
    $( ".collage_main_frame" )[0].addEventListener('mouseup', handleTouchEnd);
}

function removeFrameHandlers() {
    $( ".collage_main_frame" )[0].removeEventListener('touchstart', handleTouchStart);
    $( ".collage_main_frame" )[0].removeEventListener('touchmove', handleTouchMove);
    $( ".collage_main_frame" )[0].removeEventListener('touchend', handleTouchEnd);
    $( ".collage_main_frame" )[0].removeEventListener('mousedown', handleTouchStart);
    $( ".collage_main_frame" )[0].removeEventListener('mousemove', handleTouchMove);
    $( ".collage_main_frame" )[0].removeEventListener('mouseup', handleTouchEnd);
}

function handleCreate() {
    for (let frame of frames) {
        if (frame) {
            if (frame.hasPhoto === false) {
                return;
            }
        }
    }
    const canvas = $( ".final_image" )[0];
    const ctx = canvas.getContext('2d');
    ctx.canvas.width = $( ".collage_main_frame" ).width();
    ctx.canvas.height = $( ".collage_main_frame" ).height()
    for (let frame of frames) {
        if (frame) {
            const frm = frame;
            const top = $( frm.classSelector ).css('top').replace(/[^-\d\.]/g, '');
            const left = $( frm.classSelector ).css('left').replace(/[^-\d\.]/g, '')
            const img = $( frm.classSelector ).children()[0];
            console.log(img, frm.width, frm.height,
                    frm.startPoint.left, frm.startPoint.top)
            ctx.drawImage(img, left, top, frm.width, frm.height);
        }
    }
    $( ".results_section" ).css("display", "flex");
}

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
    if (evt.touches && evt.target.nodeName != "LABEL") {
        // Touch
        Math.round(precedingTouch.left = evt.touches[0].pageX);
        Math.round(precedingTouch.top = evt.touches[0].pageY);
        swipe.swipeStart = {
            left: Math.round(evt.touches[0].pageX),
            top: Math.round(evt.touches[0].pageY),
        };
    } else if (evt.target.nodeName != "LABEL") {
        // Mouse
        Math.round(precedingTouch.left = evt.pageX);
        Math.round(precedingTouch.top = evt.pageY);
        swipe.swipeStart = {
            left: Math.round(evt.pageX),
            top: Math.round(evt.pageY),
        };
    }

    if (evt.target.nodeName != "LABEL") {
        evt.preventDefault();
    } else {
        swipe.swipeStart = 0;
    }
}

function handleTouchMove(evt) {
    lastSwipeTouch = evt;
    evt.preventDefault();
}

function handleTouchEnd(evt) {
    if (lastSwipeTouch && swipe.startPoint) {
        let top, left;
        if (evt.touches) {
            // Touch
            left = Math.round(lastSwipeTouch.touches[0].pageX);
            top = Math.round(lastSwipeTouch.touches[0].pageY);
        } else {
            // Mouse
            left = Math.round(evt.pageX);
            top = Math.round(evt.pageY);
        }
        swipe.swipeEnd = {
            left: left,
            top: top,
        }
        for (var i = 0; i < frames.length; i++) {
            if (frames[i]) {
                if (frames[i].swipedThrough(swipe)) {
                    frames[i].split(swipe);
                    precedingTouch = null;
                }
            }
        }
    }
    if (evt.target.nodeName != "LABEL") {
        evt.preventDefault();
    }
}

function handleAspectChange() {
    let reg = /\d+/g;
    let [aspectX, aspectY] = $( ".aspect_numbers option:selected" ).text().match(reg);
    let afterResize = determineMainFrameSize(aspectX, aspectY);
    collageClean();
    $( ".collage_main_frame" ).width(pixelify(afterResize.width));
    $($("h2")[0]).text($( ".collage_main_frame" ).width());
    $( ".collage_main_frame" ).height(pixelify(afterResize.height));
    collageSetup();
}

function handleReset(event) {
    collageClean();
    collageSetup();
}

function handleBack() {
    $( ".results_section" ).css("display", "none");
}

function collageDownload() {
    const canvas = $( ".final_image" )[0];
    const image = canvas.toDataURL("image/jpg");
    $( "a" )[0].href = image;
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


function findBiggestSize() {
    let sizes = [];
    let reg = /\d+/g;
    $( ".aspect_numbers option" ).each(function (index) {
        let [aspX, aspY] = $(this).text().match(reg);
        let lengths = determineMainFrameSize(aspX, aspY);
        let size = lengths.height * lengths.width;
        sizes.push(size);
    });
    let biggest = sizes.indexOf(Math.max(...sizes));
    $($( ".aspect_numbers option" )[biggest]).attr("selected","selected");
}

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

    // Play animation and pause the handlers
    removeFrameHandlers();
    $( toShrink.classSelector ).animate({opacity: 0}, 300);
    if (targets[0].side === "bottom" || targets[0].side === "top") {
        toExpand.height += toShrink.height;
        $( toShrink.classSelector ).animate({opacity: 0}, 300);
        $( toExpand.classSelector ).animate({height: toExpand.height}, 300);
    } else {
        toExpand.width += toShrink.width;
        $( toShrink.classSelector ).animate({opacity: 0}, 300);
        $( toExpand.classSelector ).animate({width: toExpand.width}, 300);
    }
    setTimeout(function () {
        toShrink.delete();
        toExpand.update();
        appendFrameHandlers();
    }, 300);
}

function findElementsIndex(markup) {
    let r = /\d+/;
    return markup.outerHTML.match(r)[0];
}
