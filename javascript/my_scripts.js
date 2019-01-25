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

        console.log(firstX, lastX)

        if (Math.abs(diffX) > Math.abs(diffY)) {
            console.log("horizontal")
        } else {
            initialCollageSplitVertical(firstX)
        }
    }

    /* reset values */
    firstTouch = null;
    lastTouch = null;
};

function getCollageFramePosition() {
    framePostion = $( ".collage_main_frame" ).position()
}

function initialCollageSplitVertical(coordinateX) {
    for (var i = 0; i < 2; i++) {

        var markup = `
        <div class="collage_frame_${splitCounter}"></div>
        `
        $( ".collage_main_frame" ).append(markup);
        var className = ".collage_frame_" + splitCounter;
        if (i == 1) {
            frameWidth = $( ".collage_main_frame" ).width() - coordinateX + "px";
        } else {
            frameWidth = coordinateX + "px";
        }
        $( className ).css({
            width: frameWidth,
            height: "100%",
        })

        splitCounter++;
    }
}
