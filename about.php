<!DOCTYPE HTML>

<html>

<head>
    <title>SUPERSHOT - about</title>

    <meta charset="UTF-8">
    <meta name="description" content="SuperShot is an online space shooter in which time flows as you want! For free in your browser.">
    <meta name="keywords" content="SuperShot,shooter,space,game,online,2D,SuperHot,time,super,shot,super,hot,about">
    <meta name="author" content="Brunon Blok">

    <link rel="shortcut icon" type="image/png" href="/favicon.png"/>

    <link rel="stylesheet" type="text/css" href="about.css<?php echo '?'.mt_rand(); ?>" />

    <!-- Global site tag (gtag.js) - Google Analytics -->
	<script async src="https://www.googletagmanager.com/gtag/js?id=UA-125088254-1"></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag(){dataLayer.push(arguments);}
		gtag('js', new Date());

		gtag('config', 'UA-125088254-1');
	</script>

    <script src="res/jquery.js"></script> <!-- JQUERY -->
	<script src="https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js"></script>
	<script src="res/popper.js"></script> <!-- POPPER -->

    <script src="res/brunonlib.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/2.0.2/anime.min.js"></script> <!-- text anim -->

    <script>
        var s = {};
        var stars = [];

        s.w = function(){
            return document.getElementById("canvas").width;
        }

        s.h = function(){
            return document.getElementById("canvas").height;
        }

        function background() {
            for (var col = 0; col < stars.length; col++) {
                if (col == 0)
                    s.ctx.fillStyle = "white";
                else if (col == 1)
                    s.ctx.fillStyle = "yellow";
                else if (col == 2)
                    s.ctx.fillStyle = "red";

                for (var i = 0; i < stars[col].length; i++) {
                    s.ctx.fillRect(stars[col][i].x, stars[col][i].y, 1, 1);

                    stars[col][i].y += stars[col][i].speed;

                    if (stars[col][i].y > s.h()) {
                        stars[col][i].y = 0;
                        stars[col][i].x = randomInt(0, s.w());
                    }
                }
            }
        }

        function backgroundStart(n) {
            var canvas = document.getElementById("canvas");
            canvas.width = document.body.clientWidth;
            canvas.height = Math.max(window.innerHeight, document.body.clientHeight);
            s.ctx = canvas.getContext("2d");
            
            var rand;

            stars[0] = [];
            stars[1] = [];
            stars[2] = [];

            mult = s.h() / 940;

            for (var i = 0; i < n; i++) {
                rand = randomInt(0, 10);

                if (rand < 7) {
                    stars[0].push({
                        x: randomInt(0, s.w()),
                        y: randomInt(0, s.h()),
                        speed: randomInt(8, 18) * mult
                    });
                } else if (rand <= 9) {
                    stars[1].push({
                        x: randomInt(0, s.w()),
                        y: randomInt(0, s.h()),
                        speed: randomInt(8, 18) * mult
                    });
                } else {
                    stars[2].push({
                        x: randomInt(0, s.w()),
                        y: randomInt(0, s.h()),
                        speed: randomInt(8, 18) * mult
                    });
                }
            }
        }

        function update(){
            s.ctx.beginPath();

            s.ctx.clearRect(0, 0, s.w(), s.h());

            background();

            window.requestAnimationFrame(update);
        }

        window.onresize = function(){
            var canvas = document.getElementById("canvas");
            canvas.width = document.body.clientWidth;
            canvas.height = Math.max(window.innerHeight, document.body.clientHeight);

            stars = [];
            backgroundStart(150);
        }

        window.onload = function(){
            stars = [];
            backgroundStart(100);
            update();

            $('.ml10 .letters').each(function(){
                $(this).html($(this).text().replace(/([.*,.]|\w)/g, "<span class='letter'>$&</span>"));
            });

            $('.ml10 .letters').each(function(){
                $(this).html($(this).html().replace(/{/g, "<span style='color: red'>"));
                $(this).html($(this).html().replace(/}/g, "</span>"));
                $(this).html($(this).html().replace(/%/g, "<br />"));
                
                var id = this.id;

                setTimeout(function(){
                    anime.timeline({loop: false})
                    .add({
                        targets: '.ml10 #' + id + ' .letter',
                        rotateY: [-90, 0],
                        duration: 1500,
                        delay: function(el, i) {
                            return 25 * i;
                        }
                    });
                    setTimeout(function(){ $("#ml10_wrapper").css("display", "initial") }, 50);
                }, 0);
            });
        }
    </script>
</head>

<body>
    <canvas id="canvas" style="position: absolute; top: 0; left: 0;"></canvas>

    <div id="logo">
        About <span style="color: red;">SuperShot</span>
    </div>

    <div id="wrapper">
        <div id="ml10_wrapper" class="ml10" style="display: flex; justify-content: space-between; flex-direction: column; text-align: center; height: 40%; display: none; line-height: 150%;">
            <span id="l1" class="letters">SuperShot is an online {space shooter} game which you can play in your {browser}.</span>
            <br /><br /><br />
            <span id="l2" class="letters">Player can {slow down time}, {time moves} only when {player moves}.</span>
            <br />
            <span id="l3" class="letters">By collecting more score you {gain exp} and when you have enough exp you {level up}.</span>
            <br /><br /><br />
            <span id="l4" class="letters">Game was inspired by {SuperHot} and now is in {beta state} of development.</span>
        </div>
    </div>
    <span style="font-family: space; font-size: 1.5vw; display: block; position: fixed; bottom: 13%; width: 100%; text-align: center;"><a href="./" class="clickable">Back</a></span>
</body>

</html>