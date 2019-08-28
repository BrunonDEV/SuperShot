function tut(text, img, x, y, fontsize){
    $("#tutorial_box").fadeOut(150);

    setTimeout(function(){
        $("#tutorial_box").html("");

        /*if(img != null){
            $("#tutorial_box").append("<img style='max-width: 100%; max-height: 70%; height: auto; padding-bottom: 7%; margin-left: -4%;' src='" + img + "' /><br />");
        }*/

        $("#tutorial_box").append("<span class='text-wrapper'><span class='letters'>" + text + "</span></span>");
        $("#tutorial_box").css("left", (x * s.resScale) + "px");
        $("#tutorial_box").css("top", (y * s.resScaleY) + "px");

        $('.ml10 .letters').each(function(){
            $(this).html($(this).text().replace(/([.*,.!?]|\w)/g, "<span class='letter'>$&</span>"));
        });

        $('.ml10 .letters').each(function(){
            $(this).html($(this).html().replace(/{/g, "<span style='color: red'>"));
            $(this).html($(this).html().replace(/}/g, "</span>"));
            $(this).html($(this).html().replace(/%/g, "<br />"));
        });
        
        anime.timeline({loop: false})
        .add({
            targets: '.ml10 .letter',
            rotateY: [-90, 0],
            duration: 1300,
            delay: function(el, i) {
                return 45 * i;
            }
        });

        $("#tutorial_box").css("font-size", "1.2vw");

        if(fontsize != null)
            $("#tutorial_box").css("font-size", fontsize + "vw");

        $("#tutorial_box").fadeIn(150);
    }, 200);
}

function message(text, dur, callback, fontsize){
    var rand = randomInt(0, 1);

    if(rand == 0)
        rand = 250;
    else
        rand = 1300;

    tut(text, null, rand, 350, fontsize);

    setTimeout(function(){
        $("#tutorial_box").fadeOut(150);
        if(callback != null)
            callback();
    }, dur);
}

var tutorial = {
    steps: new Array(),
    step: 0
}

if(Cookies.get("tutorial_step") != null)
    tutorial.step = Cookies.get("tutorial_step");

function tutorialUpdate(){
    if(tutorial.step == 0 && tutorial.steps[0] !== true){
        tut("use {wsad} to move", null, 250, 300, 1.3);
        tutorial.steps[0] = true;
        tutorial.step = 1;
    }

    if((player.velocity.x > 0 || player.velocity.y > 0) && tutorial.step == 1 && tutorial.steps[1] !== true){
        setTimeout(function(){
            tut("{time} moves only when%{you} move", null, 1300, 550);
        }, 1000);
        tutorial.steps[1] = true;

        setTimeout(function(){
            tutorial.step = 2;
        }, 3000);
    }

    if((player.velocity.x > 0 || player.velocity.y > 0) && tutorial.step == 2 && tutorial.steps[2] !== true){
        tut("click or hold {left}%mouse button to {shoot}", null, 250, 350);

        tutorial.steps[2] = true;
        tutorial.step = 3;
    }

    if(player.cooldown_clock > 0 && tutorial.step == 3 && tutorial.steps[3] !== true){
        setTimeout(function(){
            tut("hold {right} mouse%button to {slow down} time", null, 1300, 350);
        }, 1000);

        tutorial.steps[3] = true;
        tutorial.step = 4;
    }

    if(player.slowmode && tutorial.step == 4 && tutorial.steps[4] !== true){
        setTimeout(function(){
            tut("click {ESC} to%pause the game", null, 250, 450);
        }, 1000);

        setTimeout(function(){
            tutorial.step = -1;
            $("#tutorial_box").fadeOut(150);

            Cookies.set("tutorial_step", -1, { expires: 21 });
        }, 3750);

        tutorial.steps[4] = true;
    }
}