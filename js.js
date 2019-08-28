var s = new Screen();
var world = new World();
var player;

var keys = [];
var mouse = [];

var BULLET_ID = 0;
var OPPONENT_ID = 0;
var POWUP_ID = 0;

var particles = [];
var particleMult = 1; // how many particles will spawn

var stars = [];

var cursor = false;
var cursor_coold = 0;

var gameON = false;
const FPS = 60;
var paused = false;

var images = {};

var graph_quality = null;
var backgroundCol = true;
var lowExplosion = false; // low explosion image on low quality

var audioCtx = new AudioContext();

var LBlength = 0;

var account = {};
var create_account_popup = false;

function getImage(sc) {
    //console.log("loading " + sc);

    if (sc == null)
        return false;

    if (images[sc] != null) {
        return images[sc];
    } else {
        images[sc] = loadImage(sc);

        return images[sc];
    }
}

function preLoad() {
    getImage("graph/bluecircl.png");
    getImage("graph/beam1.png");
    getImage("graph/beam2.png");
    getImage("graph/beam3.png");
    getImage("graph/redcircl.png");
    getImage("graph/redcircl2.png");

    getImage("graph/bomb.png");
    getImage("graph/bomb2.png");

    // opponents
    for(var i = 1; i < 6; i++){ // 1-5
        getImage("graph/opp" + i + ".png");
        getImage("graph/opp" + i + "_flame.png");
    }

    getImage("graph/flyBy_toL.png");
    getImage("graph/flyBy_toR.png");
    getImage("graph/flyBy_flame_toL.png");
    getImage("graph/flyBy_flame_toR.png");
    getImage("graph/flyBy_warn.png");

    getImage("graph/ship1.png");
    getImage("graph/pow_heal.png");
    getImage("graph/pow_freeze.png");

    getImage("graph/shockwave.png");
}

function stopError(err){
    console.log(err);
    Alert("Error", err);

    pauseMenu(false, true); // inst. hide pause menu
    gameOver(true);
}

function ping(){
    if(gameON === false){
        API("ping");
    }
    setTimeout("ping()", 5000);
}

function init() {
    var canvas = document.getElementById("canvas");
    canvas.width = document.body.clientWidth;
    canvas.height = Math.max(window.innerHeight, document.body.clientHeight);

    s.init(canvas);

    var particle_canvas = document.getElementById("particles");
    particle_canvas.width = document.body.clientWidth;
    particle_canvas.height = Math.max(window.innerHeight, document.body.clientHeight);

    var offctx = s.offcnv = document.getElementById("offctx");
    offctx.width = document.body.clientWidth;
    offctx.height = Math.max(window.innerHeight, document.body.clientHeight);

    s.offctx = offctx.getContext("2d");

    player = new Player(true, s);

    var oldw = 1920;
    var oldh = 940;

    console.log(s.w() + " " + s.h());

    player.w *= (s.w() / oldw);
    player.h *= (s.w() / oldw); // that's like auto height

    s.resScale *= (s.w() / oldw);
    s.resScaleY *= (s.h() / oldh);

    world.resize(s.w() / oldw, s.h() / oldh, true);

    $("#loading").css("display", "initial");

    setTimeout(function(){ preLoad(); }, 0);

    $("#loading").fadeOut(250);

    if(Cookies.get("music") == null){
        Cookies.set("music", 0.1, { expires: 21 });
        document.getElementById("mus_change").value = 0.1;
    }
    else
        document.getElementById("mus_change").value = Cookies.get("music");

    if(Cookies.get("sound") == null){
        Cookies.set("sound", 0.05, { expires: 21 });
        document.getElementById("sound_change").value = 0.05;
    }
    else
        document.getElementById("sound_change").value = Cookies.get("sound");

    if(Cookies.get("graph") == null){
        Cookies.set("graph", 3, { expires: 21 });
        changeGraph(3);
        document.getElementById("graph_change").value = 3;
    }
    else{
        changeGraph(Cookies.get("graph"));
        document.getElementById("graph_change").value = Cookies.get("graph");
    }
    
    document.getElementById("music").volume = document.getElementById("mus_change").value;
    Howler.volume(document.getElementById("sound_change").value);

    if(Cookies.get("mute") == null){
        mute(false); // music plays by default
    }

    if(!(Cookies.get("mute") === "true")){
        var promise = document.getElementById('music').play();
        if (promise !== undefined) {
            promise.then(_ => {}).catch(error => {
                setTimeout(function(){
                    alert("This browser prevents automatically playing music (you can turn it on in top left corner).");
                }, 1500);
                mute(true);
            });
        }
    }

    /*if(Cookies.get("mute") === "true"){
        mute(true);
    }*/
    
    // gui

    $(".mousetrack").mousemove(function(e){ // for cursorbox
        $("#cursor_box").css("left", e.pageX + 20 * s.resScale);
        $("#cursor_box").css("top", e.pageY + 20 * s.resScaleY);
    });
    
    // load from server

    loadLB();

    $.when(API("getVars", "", "JSON")).done(function(res){
        account.username = res.username;
        account.exp = res.exp;
        account.req_exp = res.req_exp;
        account.lvl = res.lvl;

        player.maxHP = res.maxHP;
        player.HP = res.maxHP;
    });

    // others

    handleVisibilityChange();

    window.addEventListener('online', function(){ conChange(true) });
    window.addEventListener('offline', function(){ conChange(false) });

    ping();
}

function loadLB() { // loadLeaderBoard
    $.when(API("getLB", "", "JSON")).done(function(response) {
        var r_lb = "";
        var l_lb = "";
        
        var top10 = [];

        $.each(response, function(user, score) { // key and value
            top10.push({user: user, score: score});
        });

        top10.sort(function(a, b) {
            return b.score - a.score;
        });
        
        while(top10.length > 10){
            top10.pop();
        }

        for (var i = 0; i < top10.length; i++) {
            l_lb += "<b style='color: red;'>" + (i+1) + ".</b> " + top10[i].user + "<br />";
            r_lb += "<span style=''>" + top10[i].score + "</span><br />";
        }
        
        LBlength = top10.length;

        $("#leaderboard_left").html(l_lb);
        $("#leaderboard_right").html(r_lb);
    });
}

var game = new FpsCtrl(FPS, update);

function start(x) {
    $("body").css("cursor", "none");
    $("#wrapper").css("display", "none");
    $("#CybotCookiebotDialog").css("display", "none");

    $("#wave").css("display", "initial");

    account.added_exp = null;

    document.body.addEventListener("keydown", function(e) {
        if (!paused)
            keys[e.keyCode] = true;
    });
    document.body.addEventListener("keyup", function(e) {
        keys[e.keyCode] = false;
    });

    document.body.addEventListener("mousedown", function(e) {
        if (e.button == 0) {
            if (!paused)
                mouse[0] = true; // left

            if (paused && $(e.target).attr("tag") != "nres") {
                canvas.requestPointerLock(); // close pause menu
            }
        } else if (e.button == 1) {
            if (!paused)
                mouse[1] = true; // mid
        } else {
            if (!paused)
                mouse[2] = true; // right
        }
    });
    document.body.addEventListener("mouseup", function(e) {
        if (e.button == 0) {
            mouse[0] = false; // left
        } else if (e.button == 1) {
            mouse[1] = false; // mid
        } else {
            mouse[2] = false; // right
        }
    });

    s.canvas.requestPointerLock = s.canvas.requestPointerLock || s.canvas.mozRequestPointerLock; // lock cursor

    canvas.requestPointerLock();

    if ("onpointerlockchange" in document) {
        document.addEventListener('pointerlockchange', lockChangeAlert, false);
    } else if ("onmozpointerlockchange" in document) {
        document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
    }

    world.init();

    if(x != null){ // start from custom wave
        $.when(API('requestCustomStart', x, 'text')).done(function(res){ // eval is temporary, wave and everything should be managed on server-side
            eval(res);

            gameON = true;
        }); 
    }
    else
        gameON = true;

    if(Howler._muted !== true){ // if sound isn't muted
        var promise = document.getElementById('music').play();
        if (promise !== undefined) {
            promise.then(_ => {}).catch(error => {
                Alert("Error", "This browser prevents playing music.");
            });
        }
    }

    if(tutorial.step == -1){
        $.when(API("isLogged", "", "text")).done(function(res){
            var max;

            if(res == "1")
                max = 2;
            else
                max = 1;

            var rand = randomInt(0, max);

            switch(rand){
                case 0:
                    message("don't {give up}!", 2000);
                    break;
                case 1:
                    message("keep {going}!", 2000);
                    break;
                case 2:
                    message("good to see you, {" + account.username + "}!", 2000);
                    break;
            }
        });
    }
}

function resumeGame() {
    if (cursor && gameON) {
        canvas.requestPointerLock();

        cursor = false;
    }
}

function pauseMenu(toggle, type) {
    if (type == null)
        type = false; // type true - instant fadeIn/Out

    if (toggle) { // open
        if (!type) {
            $("#pause_menu").fadeIn(150);
            $("#darken").fadeIn(150);
        } else {
            $("#pause_menu").css("display", "inital");
            $("#darken").css("display", "inital");
        }

        keys = [];
        mouse = [];

        paused = true;
    } else { // closed
        if (!type) {
            $("#pause_menu").fadeOut(150);
            $("#darken").fadeOut(150);
        } else {
            $("#pause_menu").css("display", "none");
            $("#darken").css("display", "none");
        }

        $("#option_menu").css("display", "none");

        paused = false;
    }
}

function optionMenu(toggle) {
    if (toggle) { // open
        $("#pause_menu").css("display", "none");

        $("#option_menu").css("display", "initial");
    } else { // close
        $("#option_menu").css("display", "none");

        if(gameON){
            $("#pause_menu").css("display", "initial");
        }
        else
            $("#wrapper").css("display", "initial");
    }
}

function mute(toggle, not_save){
    if(toggle){
        document.getElementById("music").pause();
        $(".mute_button").removeClass("glyphicon-volume-down");
        $(".mute_button").addClass("glyphicon-volume-off");
    }
    else{
        document.getElementById("music").play();
        $(".mute_button").removeClass("glyphicon-volume-off");
        $(".mute_button").addClass("glyphicon-volume-down");
    }

    Howler.mute(toggle);

    if(not_save == null)
        Cookies.set("mute", toggle, {expires: 21});
}

function changeGraph(value) {
    console.log("Graph quality: " + value);

    lowExplosion = false;
    backgroundCol = true;

    if (value == 3) { // Best
        stars = [];
        backgroundStart(100);
        particleMult = 1;

        $("#graph_state").html("best");
    } else if (value == 2) { // Good
        stars = [];
        backgroundStart(80);
        particleMult = 0.8;

        $("#graph_state").html("good");
    } else if (value == 1) { // Low
        stars = [];
        backgroundStart(50);
        particleMult = 0.5;

        $("#graph_state").html("low");
    } else if (value == 0) { // Worst
        stars = [];
        backgroundStart(50);
        backgroundCol = false;
        particleMult = 0.2;
        lowExplosion = true;

        $("#graph_state").html("worst");
    }

    graph_quality = value;

    Cookies.set("graph", value, { expires: 21 });
}

function lockChangeAlert() {
    if (document.pointerLockElement === canvas || document.mozPointerLockElement === canvas) {
        // locked
        $("body").css("cursor", "none");

        if (gameON)
            pauseMenu(false);

        cursor = false;
    } else {
        // unlocked
        $("body").css("cursor", "auto");

        if (gameON)
            pauseMenu(true);

        cursor = true;
    }
}

var old_worldtime = 0;
var motionblur_alpha = 0.5;
var motion_blur = true;

var experimentals = {
    mblur: false
};

function experimental(n){
    if(n === "mblur")
        experimentals.mblur = !experimentals.mblur;
}

function update(e) {
    s.ctx.beginPath();

    s.ctx.fillStyle = "rgba(0, 0, 0, 0)";
    s.ctx.fillRect(0, 0, s.w(), s.h());

    if(!player.slowmode || !experimentals.mblur){
        s.ctx.clearRect(0, 0, s.w(), s.h());
    }
    else{
        s.offctx.clearRect(0, 0, s.w(), s.h());
        s.offctx.globalAlpha = motionblur_alpha;
        s.offctx.drawImage(s.canvas, 0, 0);
        s.ctx.clearRect(0, 0, s.w(), s.h());
        s.ctx.drawImage(s.offcnv, 0, 0);

        if(motion_blur){
            motionblur_alpha -= 0.02 * world.time;

            if(motionblur_alpha < 0)
                motion_blur = false;
        }
    }

    background();

    if(Howler.volume() > 0 && Howler._muted !== true){
        for (var obj in sounds) { // sound speed
            if (!sounds.hasOwnProperty(obj)) continue;
    
            if (world.time > 0.1) {
                if (world.time != old_worldtime){
                    sounds[obj].rate(world.time);
                }
            } else
                sounds[obj].rate(0.01);
        }
    
        old_worldtime = world.time;
    }

    if (gameON) {
        player.update();
        world.update();

        GUI();
    }
    else{
        menuGUI();
    }

    if(gameON){ // && tutorial
        tutorialUpdate();
    }

    s.ctx.closePath();
    s.offctx.closePath();
}

function gameOver(skip) {
    if (skip == null)
        skip = false;

    var score = world.wave;

    var old_maxHP = player.maxHP;

    world = new World();
    player = new Player(true, s);

    player.HP = player.maxHP = old_maxHP;

    var oldw = 1920;
    var oldh = 940;

    console.log(s.w() + " " + s.h());

    player.w *= (s.w() / oldw);
    player.h *= (s.w() / oldw); // that's like auto height

    s.resScale = 1;
    s.resScaleY = 1;

    s.resScale *= (s.w() / oldw);
    s.resScaleY *= (s.h() / oldh);

    BULLET_ID = 0;
    OPPONENT_ID = 0;
    POWUP_ID = 0;

    Object.keys(sounds).forEach(function(key) { // stop all sounds
        sounds[key].stop();
    });
    Object.keys(absolute_sounds).forEach(function(key) {
        absolute_sounds[key].stop();
    });

    cursor = true;
    $("body").css("cursor", "auto");

    $("#tutorial_box").html("");
    $("#wave").css("display", "none");
    $("#wave").html("");
    $("#go_score_inn").html(score);

    $("#powups").html("");

    $("#savescore").css("display", "none");

    if (!skip) { // if player died
        $("#gameover").css("display", "initial");

        var hint;

        switch (randomInt(0, 2)) {
            case 0:
                hint = "Hint: Don't die next time."
                break;
            case 1:
                hint = "Hint: Turn on your screen before playing."
                break;
            case 2:
                hint = "Hint: Don't eat coconut butter while playing.";
                break;
        }

        $("#go_hint").html(hint);
    } else { // if player returned to menu
        $('#gameover').css('display', 'none');
        $('#wrapper').css('display', 'initial');

        particles = [];
    }

    $.when(API("processScore", score, "text")).done(function(){ // process score
        $.when(API("getVars", "", "JSON")).done(function(res){
            // update vars in menu
            $("#best_score").html(res.best);
            $("#lvl").html(res.lvl);
            $("#exp").html(res.exp);
            $("#req_exp").html(res.req_exp);

            // update account's vars 
            if(res.lvl != account.lvl){
                Alert("Level up!", "Congratulations! You got <b>lvl " + res.lvl + "</b>.<br /><br /><b style='color: red'>+5</b> max HP<br /><br />Now you start from <b style='color: red'>" + res.maxHP + "</b> HP.");
            }

            account.added_exp = res.added_exp;

            account.username = res.username;
            account.exp = res.exp;
            account.req_exp = res.req_exp;
            account.lvl = res.lvl;

            player.maxHP = res.maxHP;
            player.HP = res.maxHP;
        });
    });

    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;

    document.exitPointerLock(); // unlock cursor

    gameON = false;
}

function createAccountPopUp(){
    if(create_account_popup === false && account.username == null){
        var title = "Create account";
        var content = "If you create an account you can:<br /><br /><ul style='line-height: 250%;'><li>save <b>game progress</b> in a <b>cloud</b><li>appear in <b>top 10</b> with your best score<li>and <b>more</b>!</ul><br />Do you want to create an account <b>for free</b>?";
        var buttons = `<button type="button" class="btn btn-success" onclick="mShow('alert_reg'); API('popup', 'reg')" data-dismiss="modal">Sure!</button> <button type="button" class="btn btn-info" onclick="mShow('alert_login'); API('popup', 'log')" data-dismiss="modal">Log in</button>`;
        Alert(title, content, buttons);

        API('popup', 'open');

        create_account_popup = true;
    }
}

function addedExp(){
    if(account.added_exp != null){
        $("#added_exp").html("+ " + account.added_exp + " exp");
        $("#added_exp").fadeIn(250);
        setTimeout(function(){
            $("#added_exp").fadeOut(250);
        }, 2000);
    }
    else{
        setTimeout(function(){
            addedExp();
        }, 100);
    }
}

var pow_gui_timer = 30; // temp

function GUI() {
    // COOLDOWN GUI

    s.ctx.fillStyle = "white";
    s.ctx.fillRect(35 * s.resScale, s.h() - 60 * s.resScale, 200 * s.resScale, 25 * s.resScale);

    s.ctx.fillStyle = "green";
    s.ctx.fillRect(35 * s.resScale, s.h() - 60 * s.resScale, (player.cooldown - player.cooldown_clock) * (200 / player.cooldown) * s.resScale, 25 * s.resScale);

    // HP GUI

    s.ctx.fillStyle = "white";
    s.ctx.fillRect(35 * s.resScale, s.h() - 110 * s.resScale, 200 * s.resScale, 25 * s.resScale);

    s.ctx.fillStyle = "red";
    s.ctx.fillRect(35 * s.resScale, s.h() - 110 * s.resScale, (200 * (player.HP / player.maxHP)) * s.resScale, 25 * s.resScale);

    // POW-UPs GUI // temp

    if (pow_gui_timer <= 0) {
        powUpGUI();

        pow_gui_timer = 30;
    } else
        pow_gui_timer--;
}

function menuGUI(){
    var len = (account.exp / account.req_exp);
    if(len == null)
        len = 0;

    s.ctx.fillStyle = "white";
    s.ctx.fillRect(0.03 * s.w(), document.getElementById("exp_state").getBoundingClientRect().top + 40*s.resScale, $("#exp_state").width(), 10 * s.resScale);

    s.ctx.fillStyle = "red";
    s.ctx.fillRect(0.03 * s.w(), document.getElementById("exp_state").getBoundingClientRect().top + 40*s.resScale, $("#exp_state").width() * len, 10 * s.resScale);
}

function powUpGUI() {
    $("#powups").html("");
    for (var i = 0; i < player.pows.length; i++) {
        $("#powups").append(player.pows[i] + ": " + Math.ceil(player.pows_c[i] / 60) + "s<br/>");
    }
}

$(document).ready(function() {
    init();

    game.start();

    particlesF();

    $("#particles").insertAfter("#canvas");
});

function background() {
    for (var col = 0; col < stars.length; col++) {
        if (backgroundCol) {
            if (col == 0)
                s.ctx.fillStyle = "white";
            else if (col == 1)
                s.ctx.fillStyle = "yellow";
            else if (col == 2)
                s.ctx.fillStyle = "red";
        } else
            s.ctx.fillStyle = "white";

        var count = stars[col].length * s.resScale;

        if(count < 1)
            count = 1;
        else if(count > stars[col].length)
            count = stars[col].length;

        for (var i = 0; i < round(count); i++) {
            s.ctx.fillRect(stars[col][i].x, stars[col][i].y, 1, 1);

            stars[col][i].y += stars[col][i].speed * world.time * s.resScaleY;

            if (stars[col][i].y > s.h()) {
                stars[col][i].y = 0;
                stars[col][i].x = randomInt(0, s.w());
            }
        }
    }
}

function backgroundStart(n) {
    var rand;

    stars[0] = [];
    stars[1] = [];
    stars[2] = [];

    for (var i = 0; i < n; i++) {
        rand = randomInt(0, 10);

        if (rand < 7) {
            stars[0].push({
                x: randomInt(0, s.w()),
                y: randomInt(0, s.h()),
                speed: randomInt(8, 18)
            });
        } else if (rand <= 9) {
            stars[1].push({
                x: randomInt(0, s.w()),
                y: randomInt(0, s.h()),
                speed: randomInt(8, 18)
            });
        } else {
            stars[2].push({
                x: randomInt(0, s.w()),
                y: randomInt(0, s.h()),
                speed: randomInt(8, 18)
            });
        }
    }
}

window.onresize = function(event) {
    var oldw = s.w();
    var oldh = s.h();

    var canvas = document.getElementById("canvas");
    canvas.width = document.body.clientWidth;
    canvas.height = Math.max(window.innerHeight, document.body.clientHeight);

    s.init(canvas);

    var particle_canvas = document.getElementById("particles");
    particle_canvas.width = document.body.clientWidth;
    particle_canvas.height = Math.max(window.innerHeight, document.body.clientHeight);

    var offctx = document.getElementById("offctx");
    offctx.width = document.body.clientWidth;
    offctx.height = Math.max(window.innerHeight, document.body.clientHeight);

    player.x *= (s.w() / oldw); // yup that's that easy
    player.y *= (s.h() / oldh);

    player.w *= (s.w() / oldw);
    player.h *= (s.w() / oldw); // that's like auto height

    for (var col = 0; col < stars.length; col++) {
        for(var i = 0; i < stars[col].length; i++){
            stars[col][i].x *= (s.w() / oldw);
            stars[col][i].y *= (s.h() / oldh);
        }
    }

    s.resScale *= (s.w() / oldw);
    s.resScaleY *= (s.h() / oldh);

    particles = []; // that's temporary

    $("#tutorial_box").css("left", $("#tutorial_box").css("left") * s.resScale);
    $("#tutorial_box").css("top", $("#tutorial_box").css("top") * s.resScaleY);

    world.resize(s.w() / oldw, s.h() / oldh);
};

var previous_muted_state = true;

function handleVisibilityChange(){
    var hidden, visibilityChange; 

    if (typeof document.hidden !== "undefined") {
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }

    if(hidden !== undefined){
        document.addEventListener(visibilityChange, function(){ // Page Visibility API
            if(document[hidden]){
                previous_muted_state = Howler._muted;
                mute(true, true);
            } else {
                mute(previous_muted_state, true); // sec "true" is for not_save (to a cookie)
            }
        });
    }
}

var connection = true;

function conChange(x){
    if(x){ // online
        $("#connection_info_text").html("Connection restored");

        $("#connection_info").css({
            "background": "green",
            "color": "white",
            "font-size": "1.2vw"
        });

        $("#connection_info").animate({
            right: "0%"
        }).delay(1500).animate({
            right: "-13.5%"
        });
    }
    else{ // offline
        $("#connection_info_text").html("Connection lost");

        $("#connection_info").css({
            "background": "red",
            "color": "black",
            "font-size": "1.3vw"
        });

        $("#connection_info").animate({
            right: "0%"
        }).delay(1500).animate({
            right: "-13.5%"
        });
    }

    connection = x;

    console.log("Connection state: " + x);
}

function toggleCursorBox(html){
    if(html != null){
        $("#cursor_box").html(html);
        $("#cursor_box").fadeIn(250);

        $("#cursor_box").html($("#cursor_box").html().replace(/{/g, "<span style='color: red'>"));
        $("#cursor_box").html($("#cursor_box").html().replace(/}/g, "</span>"));
        $("#cursor_box").html($("#cursor_box").html().replace(/%/g, "<br />"));
    }
    else
        $("#cursor_box").fadeOut(250);
}

function randomFloat(min, max) {
    return parseFloat((Math.random() * (min - max) + max).toFixed(4));
}

function drawImageRot(img, sx, sy, sw, sh, x, y, w, h, deg) {
    s.ctx.translate(x + w / 2, y);

    s.ctx.rotate(deg);

    s.ctx.drawImage(img, sx, sy, sw, sh, w / 2 * (-1), 0, w, h);

    s.ctx.rotate(deg * (-1));
    s.ctx.translate((x + w / 2) * (-1), y * (-1));
}

function drawSprite(sprite, x, y, scale, tileW, tileH, rows, cols, count) {
    var cX = count;
    var cY = 0;
    while (cX > rows) {
        cX -= (cX - rows);
        cY++;
    }

    cX *= tileW;
    cY *= tileH;

    s.ctx.drawImage(sprite, cX, cY, tileW, tileH, x, y, scale * tileW, scale * tileW);
}

function skipToWave(wave) {
    wave--;

    world.wave = wave;
}

//////////////////////

function intersect(e1, e2) {
    if (e1.x + e1.w > e2.x && e1.x < e2.x + e2.w && e1.y + e1.h > e2.y && e1.y < e2.y + e2.h) {
        return true;
    }
    return false;
}

function requestFullScreen(element) {
    // Supports most browsers and their versions.
    var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

    if (requestMethod) { // Native full screen.
        requestMethod.call(element);
    } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
}

/////////////////////

function Particle(x, y, radius) {
    this.init(x, y, radius);
}

Particle.prototype = {

    init: function(x, y, radius) {

        this.alive = true;

        this.radius = radius * s.resScale || 10;
        this.wander = 0.15;
        this.theta = random(TWO_PI);
        this.drag = 0.92;
        this.color = '#fff';

        this.x = x || 0.0;
        this.y = y || 0.0;

        this.vx = 0.0;
        this.vy = 0.0;
    },

    move: function() {

        this.x += this.vx * s.resScale * world.time;
        this.y += this.vy * s.resScaleY * world.time;

        this.vx *= this.drag;
        this.vy *= this.drag;

        this.theta += random(-0.5, 0.5) * this.wander;
        this.vx += sin(this.theta) * 0.1;
        this.vy += cos(this.theta) * 0.1;

        var t;

        if (world.time > 0.5)
            t = 0.93;
        else if (world.time > 0)
            t = 0.96;
        else
            t = 1;

        this.radius *= t;
        this.alive = this.radius > 0.5;
    },

    draw: function(ctx) {

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, TWO_PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
};

function particlesF() {
    var MAX_PARTICLES = 280;
    var COLOURS = ['#69D2E7', '#A7DBD8', '#E0E4CC', '#F38630', '#FA6900', '#FF4E50', '#F9D423'];

    var pool = [];

    particles_obj = Sketch.create({
        element: document.getElementById("particles"),
        retina: 'auto'
    });

    particles_obj.spawn = function(x, y) {

        var particle, theta, force;

        if (particles.length >= MAX_PARTICLES)
            pool.push(particles.shift());

        particle = pool.length ? pool.pop() : new Particle();
        particle.init(x, y, random(5, 40));

        particle.wander = random(0.5, 2.0);
        particle.color = random(COLOURS);
        particle.drag = random(0.9, 0.99);

        theta = random(TWO_PI);
        force = random(2, 8);

        particle.vx = sin(theta) * force;
        particle.vy = cos(theta) * force;

        particles.push(particle);
    };

    particles_obj.update = function() {

        var i, particle;

        for (i = particles.length - 1; i >= 0; i--) {

            particle = particles[i];

            if (particle.alive) particle.move();
            else pool.push(particles.splice(i, 1)[0]);
        }
    };

    particles_obj.draw = function() {

        particles_obj.globalCompositeOperation = 'lighter';

        for (var i = particles.length - 1; i >= 0; i--) {
            particles[i].draw(particles_obj);
        }
    };
}