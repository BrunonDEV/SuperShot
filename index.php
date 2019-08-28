<?php

session_start();

include("functions.php");

loadVars();
unsetGame();

$useragent=$_SERVER['HTTP_USER_AGENT'];
if(preg_match('/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i',$useragent)||preg_match('/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i',substr($useragent,0,4))){
	// if user is on mobile
	include("mobile.php");

	exit();
}

?>

<!DOCTYPE HTML>

<html>

<head>
	<title>SUPERSHOT</title>

	<meta charset="UTF-8">
	<meta name="description" content="SuperShot is an online space shooter in which time flows as you want! For free in your browser.">
	<meta name="keywords" content="SuperShot,shooter,space,game,online,2D,SuperHot,time,super,shot,super,hot">
	<meta name="author" content="Brunon Blok">
    
  	<link rel="shortcut icon" type="image/png" href="/favicon.png"/>
	
	<script src="res/jquery.js"></script> <!-- JQUERY -->
	<script src="https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js"></script>
	<script src="res/popper.js"></script> <!-- POPPER -->
	
	<!-- Latest compiled and minified CSS -->
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
	<!-- Optional theme -->
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">
	<!-- Latest compiled and minified JavaScript -->
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
    
	<script src="res/howler/howler.core.js"></script> <!-- HOWLER SOUND JS -->
	<script src="res/howler/plugins/howler.spatial.js"></script>
	<script src="res/brunonlib.js"></script> <!-- BrunonLIB -->
	<script src="res/FPSCtrl.js"></script>
	<script src="res/sketch.min.js"></script>

	<script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/2.0.2/anime.min.js"></script> <!-- text anim -->
	
	<link rel="stylesheet" href="res/scrollbar/css/perfect-scrollbar.css">
	<script src="res/scrollbar/dist/perfect-scrollbar.js"></script>
	
	<link rel="stylesheet" type="text/css" href="style.css<?php echo '?'.mt_rand(); ?>" />
	
	<script src="tutorial.js?v=1"></script>
	<script src="sound.js?v=1"></script>
	<script src="classes.js?v=4"></script>
	<script src="js.js?v=1"></script>
	<script src="bullets.js?v=1"></script>

	<script type="application/ld+json">
	{
		"@context": "http://schema.org",
		"@type": "Game",
		"url": "http://supershot.pro",
		"name": "SuperShot Online Game"
	}
	</script>

	<script id="Cookiebot" src="https://consent.cookiebot.com/uc.js" data-cbid="cebd2ca9-4c88-46ec-a474-5ba7daf77082" type="text/javascript" async></script>

	<!-- Global site tag (gtag.js) - Google Analytics -->
	<!--
	<script async src="https://www.googletagmanager.com/gtag/js?id=UA-125088254-1"></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag(){dataLayer.push(arguments);}
		gtag('js', new Date());

		gtag('config', 'UA-125088254-1');
	</script>
	-->
</head>

<body oncontextmenu="if(!keys[17]) return false;">
	<!-- NOSCRIPT -->

	<div id="description" style="display: block; color: black;">
		SuperShot.pro is an online space shooter (game) which you can play in your browser.<br />
		The game has procedurally generated waves, different types of enemy spaceships and plenty types of bullets.<br />
		You can play SuperShot without downloading anything to your computer.<br />
		On SuperShot.pro you can create an account and then you game progress will be saved in a clound storage.<br />
		You can gain experience points (exp) by getting higher score, if you have enough exp you level up.<br />
		Each level (lvl) gives you +5 bonus to start HP (health points).<br /><br />
		<b>Enable JavaScript to play.</b>
	</div>
	<script>$("#description").css("display", "none");</script>

	<!-- INGAME -->

	<canvas id="canvas" style="position: absolute; top: 0; left: 0;"></canvas>
	<canvas id="particles" style="position: absolute; top: 0; left: 0;"></canvas>
	<canvas id="offctx" style="position: absolute; top: 0; left: 0; display: none;"></canvas>
	
	<div id="wave" style="position: absolute; right: 2%; top: 1%; color: white; font-size: 2.0vw; font-family: space;"></div>
	<div id="powups" style="position: absolute; right: 2%; bottom: 1%; color: white;"></div>

	<div id="tutorial_box" class="ml10"></div>

  	<!-- MAIN MENU WRAPPER -->
    
	<div id="wrapper">
		<div id="logo">
			<div id="logo_inn">SUPER<span style="color: red">SHOT</span></div>
		</div>

		<?php
		if (count($_SESSION['errors']) > 0){
			$text = "";
			foreach($_SESSION['errors'] as $error){
				$text .= $error . "<br /><br />";
			}

			echo "<script>setTimeout(function(){ Alert('Error', '<center>" . $text . "</center>'); }, 50)</script>";

			unset($_SESSION['errors']);
		}

		if(isset($_GET['reg'])){
			$text = "<b>Successfully registered!</b><br /><br />We send you an e-mail with <b>confirmation link</b>.";
			echo "<script>setTimeout(function(){ Alert('Done', '<center>" . $text . "</center><br />'); }, 50)</script>";
		}
		if(isset($_GET['con'])){
			$text = "You successfully confirmed your account.";
			echo "<script>setTimeout(function(){ Alert('Done', '<center><b>" . $text . "</center></b><br/>'); }, 50)</script>";
		}

		?>

		<div id="menu" class="unselectable">
			<span class="clickable" onmouseenter="world.time = 0.2;" onmouseleave="world.time = 1" onclick="start()">
				Play
			</span><br />
				<span style="font-size: 1.4vw;" class="mousetrack  
				<?php if(getVar("best") < 35):  ?>
					disabled pointable
				<?php else: ?>
					clickable
				<?php endif; ?>"
				<?php if(getVar("best") >= 35):  ?> 
					onmouseenter="world.time = 0.2;" onmouseleave="world.time = 1" onclick="start(25)"
				<?php else: ?>
					onmouseenter="toggleCursorBox('Reach {35th wave} to unlock')" onmouseleave="toggleCursorBox()"
				<?php endif; ?>>
					25th wave
			</span>
		</div>
		
		<div id="cursor_box" class="unselectable"></div>

		<div id="leaderboard">
			<div style="font-family: space; text-align: right; font-size: 2.2vw;">Top <span style="color: red;">10</span></div><br />
			<div style="box-sizing: border-box; overflow: hidden; margin-top: 5%;">
				<p id="leaderboard_left" style="text-align: left; left: 0%; position: absolute" class=""></p>
				<p id="leaderboard_right" style="text-align: right; right: 0%; position: absolute" class=""></p>
			</div>
		</div>

		<div id="account">
			<?php if(isset($_SESSION['username'])): ?>
			
			<span id="account_name">
				<?php
				/*$username_array = str_split($_SESSION['username']);
				$i = 0;

				foreach($username_array as $char) {
					if($i < floor(count($username_array) / 2)){
						echo "<span style='color: red'>" . $char . "</span>";
					}
					else{
						echo "<span style='color: white'>" . $char . "</span>";
					}
					$i++;
				}*/

				echo $_SESSION['username'];
				?>
			</span>

			<?php else: ?>

			<span id="account_name">GUEST</span>

			<?php endif; ?>

			<div style="font-size: 1.2vw; margin-top: 12%;">
				<span>Best: <span id="best_score" style="color: yellow;"><?php echo getVar("best"); ?></span></span>
				<br /><br />
				<span class="pointable italhover" onclick="Alert('LVL info', 'Each lvl gives you <b>+5</b> to HP.<br /><br />At lvl ' + account.lvl + ' you start from <b>' + player.maxHP + '</b> HP.')">LVL: <span id="lvl" style="color: yellow;"><?php echo getVar("lvl"); ?></span></span>
				<br />
				<span class="pointable italhover" onclick="Alert('EXP info', 'Gain <b>exp</b> to <b>level up</b>!<br /><br />EXP formula = (score <= 25 - 1) + (score > 25 - 1) * 2')" id="exp_state">EXP: <span id="exp" style="color: yellow;"><?php echo getVar("exp"); ?></span>/<span id="req_exp" style="color: yellow;"><?php echo getVar("req_exp"); ?></span></span>
				<br /><br />
				<span id="added_exp" style="display: none; color: yellow; font-family: Source Sans Pro, sanf-serif; font-size: 0.9vw; font-weight: 300;"></span>
			</div>
		</div>
		
		<div id="reglog" style="position: fixed; bottom: 1%; left: 1%; color: white; font-family: space; font-size: 0.9vw;" class="unselectable">
			<?php if(!isset($_SESSION["username"])): ?>
				<span class="clickable" onclick="mShow('alert_login')">Login</span>
				<span class="clickable" onclick="mShow('alert_reg')">Register</span>
			<?php else: ?>
				<a class="clickable" href="logout.php">Logout</a>
			<?php endif; ?>
		</div>
		
		<span tag="nres" style="position: fixed; left: 0.5%; top: 10px; color: white; display: table;">
			<span onclick="optionMenu(true); $('#wrapper').css('display', 'none');" style="display: table-cell; vertical-align: middle; font-size: 1.2vw;" class="glyphicon glyphicon-cog clickable"  aria-hidden="true"></span>
			<span onclick="if(Howler._muted) mute(false); else mute(true);" style="left: 20%; display: table-cell; vertical-align: middle; font-size: 1.4vw;" class="glyphicon glyphicon-volume-down clickable mute_button" aria-hidden="true"></span>
			<span onclick="requestFullScreen(document.body)" style="position: fixed; left: 0.6%; top: 5%; font-size: 0.95vw;" class="glyphicon glyphicon-fullscreen clickable fullscr_button" aria-hidden="true"></span>
		</span>
				
		<div id="links" style="position: fixed; right: 6%; top: 1.9%; color: white;">
			<a href="https://twitter.com/BrunonDEV?ref_src=twsrc%5Etfw" class="twitter-follow-button" data-show-count="false">Follow @BrunonDEV</a><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
		</div>

		<span style="position: fixed; font-family: space; font-size: 0.8vw; top: 1.5%; right: 1%; color: white;">
			<a href="/changelog.php" target="_blank" class="clickable">InDev</a>
			<br />
			<a href="/about.php" style="text-align: right; display: block; margin-top: 3%;" class="clickable">About</a>
		</span>

		<!--<div style="position: fixed; bottom: 0%; left: 0%; width: 100%; text-align: center"><script type="text/javascript" src="https://www.gtburst.com/show/10677"></script></div>-->
	</div>
    
  	<!-- GAME OVER WRAPPER -->
	
	<div id="gameover" style="display: none;">
		<div id="go_text">
			<div id="go_text_inn">GAME <span style="color: red">OVER</span></div>
		</div>
		
		<div id="go_menu">
            <span id="savescore" class="clickable" onmouseenter="world.time = 0.2;" onmouseleave="world.time = 1" onclick="saveScore()" style="color: red; display: none;">
				Save Score<br /><br/>
			</span>
			<span class="clickable" onmouseenter="world.time = 0.2;" onmouseleave="world.time = 1" onclick="$('#gameover').css('display', 'none'); $('#wrapper').css('display', 'initial'); loadLB(); addedExp(); createAccountPopUp();">
				Menu
			</span>
		</div>
		
		<div id="go_score">
			Score: <span id="go_score_inn"></span>
		</div>
		<div id="go_hint">
			Random hint
		</div>
	</div>
	
	<div id="darken"></div>
	
 	<!-- PAUSE MENU WRAPPER -->
    
	<div id="pause_menu">
		<span tag="nres" style="font-size: 3.2vw; color: yellow; margin-left: 2%;">Paused</span><br /><br />
		
		<span tag="nres" class="pause_option clickable" onclick="pauseMenu(false, true); gameOver(true); loadLB(); addedExp(); createAccountPopUp();">menu</span>
		<span tag="nres" class="pause_option clickable" onclick="optionMenu(true);">options</span>
		<span tag="nres" class="pause_option clickable" style="font-size: 1.8vw;" onclick="resumeGame()">resume</span>

		<span tag="nres" id="mute_button" onclick="if(Howler._muted) mute(false); else mute(true);" style="position: fixed; left: 0.5%; top: 1%; font-size: 1.6vw;" class="glyphicon glyphicon-volume-down clickable mute_button" aria-hidden="true"></span>
		<span tag="nres" onclick="requestFullScreen(document.body)" style="position: fixed; right: 1%; top: 2%; font-size: 1.1vw;" class="glyphicon glyphicon-fullscreen clickable fullscr_button" aria-hidden="true"></span>
	</div>
    
  	<!-- OPTION MENU WRAPPER -->
	
	<div id="option_menu">
		<span id="nres" style="font-size: 3.2vw; color: yellow; margin-left: 2%;">Options</span><br /><br />
		<span tag="nres" class="pause_option" style="display: table">
			Music
			<input tag="nres" onchange="document.getElementById('music').volume = this.value; Cookies.set('music', this.value, { expires: 21 });" id="mus_change" type="range" min="0" max="1.2" step="0.01" style="width: 35%; display: table-cell; vertical-align: middle;"/>
		</span>
		<span tag="nres" class="pause_option" style="display: table">
			Sounds
			<input tag="nres" onchange="Howler.volume(this.value); Cookies.set('sound', this.value, { expires: 21 });" id="sound_change" type="range" min="0" max="0.5" step="0.01" style="width: 35%; display: table-cell; vertical-align: middle;"/>
		</span>
		<span tag="nres" class="pause_option" style="display: table; vertical-align: middle;">
			Quality <span id="graph_state" style="font-size: 0.7vw; position: absolute; right: 10%;">graph state</span>
			<input tag="nres" onchange="changeGraph(this.value)" id="graph_change" type="range" min="0" max="3" step="1" style="width: 35%; display: table-cell; vertical-align: middle;"/>
		</span>
		<br />
		<span tag="nres" class="pause_option clickable" onclick="optionMenu(false)">Back</span>

		<span tag="nres" onclick="if(Howler._muted) mute(false); else mute(true);" style="position: fixed; left: 0.5%; top: 1%; font-size: 1.6vw;" class="glyphicon glyphicon-volume-down clickable mute_button" aria-hidden="true"></span>
		<span tag="nres" onclick="requestFullScreen(document.body)" style="position: fixed; right: 1%; top: 2%; font-size: 1.1vw;" class="glyphicon glyphicon-fullscreen clickable fullscr_button" aria-hidden="true"></span>
	</div>

	<!-- OTHERS -->
	
	<div id="loading" style="display: none; position: fixed; width: 100%; margin-left: 0.5%; text-align: center; bottom: 1%; font-size: 1.0vw; opacity: 0.5; color: white;">Loading...</div>
  
	<audio autoplay="false" id="music" loop>
		<source src="music2.mp3" type="audio/mpeg">
	</audio>
    
 	<!-- LOGIN DIALOG -->

	<div id="alert_login" class="modal fade no-shadow" role="dialog" style='color: black'>
		<div class="modal-dialog" style="max-width: 40%;">

			<!-- Modal content-->
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal">&times;</button>
					<h3 class="modal-title">Log in</h3>
				</div>
				<div class="modal-body font-gloria" style="text-align: center;">
					<form id="log_in_form" name="log_in_form" action="account.php?action=log" method="post">
						Login:<br />
						<input type="text" name="login" /><br /><br />
						Password:<br />
						<input type="password" name="password" /><br />
					</form>
				</div>
				<div class="modal-footer">
					<span><button type="button" class="btn btn-success" onclick='$("#log_in_form").submit();' data-dismiss="modal">Login</button></span>&nbsp<button type="button" class="btn btn-default" onclick="" data-dismiss="modal">Close</button>
				</div>
			</div>

		</div>
	</div>
	
	<!-- REGISTER DIALOG -->

	<div id="alert_reg" class="modal fade no-shadow" role="dialog" style='color: black'>
		<div class="modal-dialog" style="max-width: 40%;">

			<!-- Modal content-->
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal">&times;</button>
					<h4 class="modal-title">Create account</h4>
				</div>
				<div class="modal-body font-gloria">
					<div class="modal-body font-gloria" style="text-align: center;">
						<form id="register_form" name="register_form" action="account.php?action=reg" method="post">
							Login:<br />
							<input type="text" name="username" /><br /><br />
							E-mail:<br />
							<input type="email" name="email" /><br /><br />
							Password:<br />
							<input type="password" name="password_1" /><br /><br />
							Confirm password:<br />
							<input type="password" name="password_2" /><br /><br />
							<!--<input name="accept_terms" type="checkbox" /> I accept <span class="clickable" style="color: blue" onclick="window.open('termsofuse.txt', '_blank')">terms of use</span>.-->
						</form>
					</div>
				</div>
				<div class="modal-footer">
					<span><button type="button" class="btn btn-success" onclick='$("#register_form").submit();' data-dismiss="modal">Register</button></span>&nbsp<button type="button" class="btn btn-default" onclick="" data-dismiss="modal">Close</button>
				</div>
			</div>

		</div>
	</div>

	<!-- BETTER ALERT DIALOG -->

    <div id="alert_modal" class="modal fade no-shadow" role="dialog" style='color: black'>
      <div class="modal-dialog">

        <!-- Modal content-->
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal">&times;</button>
            <h3 class="modal-title" id="alert_title"></h3>
          </div>
          <div class="modal-body font-gloria">
            <p id="alert_content"></p>
          </div>
          <div id="alert_buttons" class="modal-footer">
            <span id="alert_plus_buttons"></span>&nbsp<button type="button" class="btn btn-default" onclick="" data-dismiss="modal">Close</button>
          </div>
        </div>

      </div>
	</div>
	
	<!-- INTERNET CONNECTION INFO -->

	<div id="connection_info">
		<div id="connection_info_text"></div>
	</div>
</body>

<!-- SUPERSHOT by Brunon Blok (C) -->

</html>