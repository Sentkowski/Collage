$(document).ready(function() {
    $( ".welcome_button" ).click(function() {
        hideWelcome();
    });
});

function hideWelcome() {
    $( ".to_fade" ).addClass( "fade" );
    $( ".to_slide_down" ).addClass( "slide_down" );
    $( ".to_shrink" ).addClass( "shrink" );

    setTimeout(function() {
        $( ".to_fade" ).remove();

        $( ".to_show" ).css("opacity", "0");

        $( ".to_show" ).css("display", "block");
        $( ".to_show_flex" ).css("display", "flex");

        showInstructions();

    }, 300);
};

function showInstructions() {
    var elementsToShow = $( ".to_show" )
    var flexElementsToShow = $( ".to_show_flex" )

    var elementsSequence = [
        [elementsToShow[2]],
        [elementsToShow[0], elementsToShow[1], elementsToShow[3]],
        [elementsToShow[4], elementsToShow[5]],
        [elementsToShow[6], elementsToShow[7], elementsToShow[8], elementsToShow[9]],
        [elementsToShow[10], elementsToShow[11]]
    ]

    for (let i = 0; i < elementsSequence.length; i++) {
        for (let j = 0; j < elementsSequence[i].length; j++) {
            setTimeout(() => {
                $(elementsSequence[i][j]).animate({opacity: 1}, 300)
            }, i * 50)
        }
    }


}
