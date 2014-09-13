// Pop up modal
(function() {
    $("button").click(function () {
        $(".pop").fadeIn(300);
    });

    $(".pop > span, .pop").click(function () {
        $(".pop").fadeOut(300);
    });
    $('.surface').mousedown(function (){
        $('.help').fadeOut(500);
    })

    // If Firefox
    if (bowser.gecko){
        $(".firefox").fadeIn(200);
    };
}());