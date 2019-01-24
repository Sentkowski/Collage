$(document).ready(function() {

    $( ".proceed_button" ).click(function() {
        fromWelcomeToInstructions();
    });

    $( ".instructions_button" ).click(function() {
        hideCollage();
    });

});

function fromWelcomeToInstructions() {
    $( ".main_section" ).animate({opacity: 0}, 300, function() {
        $( ".main_section" ).remove();
        showInstructions();
    });

    $( ".to_slide_down" ).addClass( "slide_down" );
    $( ".to_shrink" ).addClass( "shrink" );

    $( ".button_text" ).animate({opacity: 0}, 200, function() {
        $( ".button_text" ).text("Fair enough");
        $( ".button_text" ).animate({opacity: 1}, 200, function() {
            $( ".proceed_button" ).off().click(function() {
                hideInstructions();
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
        $( ".collage_section" ).css("display", "flex");
        $( ".collage_section" ).animate({opacity: 1}, 300);
    })
}

function hideCollage() {
    $( ".collage_section" ).animate({opacity: 0}, 300, function () {
        $( ".collage_section" ).css("display", "none");
        showInstructions();
    });
}
