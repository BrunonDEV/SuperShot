<?php

session_start();

include("functions.php");

$action = clean($_POST["action"]);
$content = $_POST["arg"];

if($action === "getLB"){
    $data = file_get_contents("leaderboard.json");
    print_r($data);
}
else if($action == "getScore"){
    echo $_SESSION["score"];
}
else if($action == "getUsername"){
    echo $_SESSION["username"];
}
else if($action == "temp"){
    setGame();
    skipToWave($content);
}
else if($action == "processScore"){
    if(!isset($_SESSION["wave"])){
        exit();
    }

    $data = file_get_contents("leaderboard.json"); // leaderboard data
    $json = json_decode($data, true);

    $score = intval($_SESSION["wave"]); // player's score

    $_SESSION["score"] = $score; // temp save to session

    if($score > getVar("best")){ // if it's personal best
        saveBest($_SESSION["score"]); // save it
    }

    $best = false;

    foreach($json as $user => $uscore) { // key and val
        if($score > $uscore){
            $best = true;
        }
    }

    $not10 = false;

    if(count($json) < 10){ // if list isn't full
        $best = true;
        $not10 = true;
    }

    if($score < getVar("best")){ // if player had better score
        $best = false;
    }

    if($best){ // save score to leaderboard
        if(isset($_SESSION['username'])){ // logged in
            $newlb;

            $added = false;

            array_multisort($json, SORT_DESC); // sort from best to worst

            foreach($json as $user => $uscore) { // new array
                if($user === $_SESSION['username']){
                    $newlb[$user] = $score; // if user exist in lb
                    $added = true;
                }
                else{
                    $newlb[$user] = $uscore; // if not
                }
            }

            if($added === false){ // if not
                if($not10 === false)
                    array_pop($newlb);
                
                $newlb[$_SESSION['username']] = $score;
            }

            $handle = fopen("leaderboard.json", 'w'); // save to file
            fwrite($handle, json_encode($newlb));
            fclose($handle);
        }
    }

    processVars($score);

    unsetGame();
}
else if($action == "getVars"){
    $data = $_SESSION["userData"];
    $data["best"] = getVar("best");
    $data["username"] = $_SESSION["username"];
    
    $data["req_exp"] = $_SESSION["userData"]["lvl"] * LVL_EXP_MULT;
    $data["added_exp"] = $_SESSION["added_exp"];

    $data["maxHP"] = $_SESSION["userData"]["maxHP"];

    echo json_encode($data);
}
else if($action == "isLogged"){
    if(isset($_SESSION["username"])){
        echo "1";
    }
    else
        echo "0";
}
else if($action == "getCookie"){
    echo $_COOKIE[$content];
}
else if($action == "requestCustomStart"){
    if(($content == '25' || $content == 25) && getVar("best") >= 35){
        echo "skipToWave(25);"; // temporary

        setGame();

        skipToWave($content);
    }
}
else if($action == "requestNewWave"){
    $data;
    $data["error"] = "";

    // CHECK DATA

    if(!isset($_SESSION["wave"])){ // game isn't set
        setGame(); // SET GAME
    }
    else{
        $_SESSION["wave"]++;

        if((int)$_SESSION["wave"] != (int)$content["wave"]){
            $data["error"] .= "error: " . $_SESSION["wave"] . " != " . $content["wave"] . "\n";
            unsetGame();
        }
    }

    if(!isset($content["player_HP"])){
        $data["error"] .= "error: no input\n";
    }
    else if($content["player_HP"] != $_SESSION["HP"] && $_SESSION["wave"] != 1){
        $data["error"] .= "error: wrong input: HP\n";
    }

    if($_SESSION["kill_additional"] === false){
        $data["error"] .= "error: kill add don't match; propably you lost internet connection\n";
        unsetGame();
    }

    if($_SESSION["lastFullOppCount"] != $_SESSION["kills"] && $_SESSION["lastFullOppCount"] != $_SESSION["kills"] + 1 && $_SESSION["startwave"] != $_SESSION["wave"]){ // check last random opponents count and kills in last wave +- 1
        $data["error"] .= "error: kills don't match; propably you lost internet connection \n"; //. $_SESSION["lastFullOppCount"]. " != " . $_SESSION["kills"];
        unsetGame();
    }

    if($_SESSION["lastFullOppCount"] == $_SESSION["kills"] + 1){
        $_SESSION["kills_additional"] = false;
    }

    $_SESSION["kills"] = 0; // clear kills

    $_SESSION["activePowUps"] = array(); // clear active powUps

    // CHECK CONFIRMATION

    if($_SESSION["confirmWave"] == false || $_SESSION["confirmAddPowUp"] == false){
        $data["error"] .= "error: no confirmation\n";
        unsetGame();
    }

    $_SESSION["confirmWave"] = false;

    // CHECK IS PLAYER DATA CORRECT
    
    $player_sx = 5;
    $player_sy = 5;
    $player_coold = $_SESSION["player_cooldown"];

    // this code will be evaled in JS after this function
    $correct_code = "";
    $correct_code .= "API('confirmWave');";

    if(!isset($content["player_sx"]) || !isset($content["player_sy"]) || !isset($content["player_coold"])){
        $data["error"] .= "error: no input\n";
        unsetGame();
    }
    else if($content["player_sx"] != $player_sx || $content["player_sy"] != $player_sy || $content["player_coold"] != $player_coold){
        $data["error"] .= "error: wrong input: data\n";
        unsetGame();
    }

    if(isset($_SESSION["factors"]) && $_SESSION["startwave"] != $_SESSION["wave"]){ // world factors were set before
        if(count(array_diff($content["factors"], $_SESSION["factors"])) > 0){
            $data["error"] .= "error: wrong factors data\n";
            unsetGame();
        }
    }

    /*if(abs($_SESSION["bullets"] - $content["bullets"]) > 2){
        $data["error"] .= "error: wrong bullets data\n";
        unsetGame();
    }*/

    // RETURN DATA

    $data["code"] = $correct_code;

    $processData = processFactors();
    $data["opp"] = $processData["opp"];
    $data["factors"] = $processData["factors"];

    // !! powWaves (waves with powerups)

    if($_SESSION["wave"] % 10 == 0 || $_SESSION["wave"] == 1){
        $tenth = floor($_SESSION["wave"] / 10) + 1;
        $count = $tenth;

        if($count > 4)
            $count = 4;

        $powWaves = array();

        for($i = 0; $i < $count; $i++){
            $min = ($tenth - 1)*10;

            if($min < 3)
                $min = 3;

            array_push($powWaves, rand($min, ($tenth - 1)*10 + 9));
        }

        $data["powWaves"] = $powWaves;
        $_SESSION["powWaves"] = $powWaves;
    }

    // !! flyByes

    // check ->
    if(abs($_SESSION["deadFlyByes"] - $_SESSION["lastFlyByes"]) > $_SESSION["tenth"]){
        $data["error"] .= "error: flyByes don't match";
        unsetGame();
    }
    // <-

    $flyByes = array();

    $flyByes["count"] = rand(-2, $_SESSION["tenth"]); // -2 for more chance for 0

    if($flyByes["count"] < 0)
        $flyByes["count"] = 0;

    if($_SESSION["wave"] < 3) // flyByes are from 3rd wave
        $flyByes["count"] = 0;

    $_SESSION["lastFlyByes"] += $flyByes["count"]; // for future check
    
    for($i = 0; $i < $flyByes["count"]; $i++){
        $flyByes["coolds"][$i] = rand(0, $data["opp"] * 2);
    }

    $flyByes["params"]["speed"] = 18 + $_SESSION["fifth"] * 2; // 20 at start
    $flyByes["params"]["pow"] = 12.5 + $_SESSION["tenth"] * 2.5; // 15 at start

    $data["flyByes"] = $flyByes;

    echo json_encode($data); // RETURN DATA IN JSON
}
else if($action == "confirmWave"){
    $_SESSION["confirmWave"] = true;
}
else if($action == "playerHurt"){
    $_SESSION["HP"] -= $content;
}
else if($action == "playerHeal"){
    if($_SESSION["powUpsToUse"] == 0){
        echo "error: powUps don't match";
        unsetGame();
    }

    $_SESSION["HP"] += 15;

    if($_SESSION["HP"] > $_SESSION["userData"]["maxHP"]){
        $_SESSION["HP"] = $_SESSION["userData"]["maxHP"];
    }

    $_SESSION["powUpsToUse"]--;
}
else if($action == "addPowUp"){
    if($_SESSION["powUpsToUse"] == 0){
        $data["err"] = "error: powUps don't match";
        unsetGame();
    }
    $_SESSION["powUpsToUse"]--;

    $content["type"] = clean($content["type"]);
    $content["coold"] = clean($content["coold"]);

    if($content["type"] === "freeze" && $content["coold"] > 5*60){
        $data["err"] = "error: powUp isn't valid";
        unsetGame();
    }
    else if($content["type"] === "rapidfire" && $content["coold"] > 10*60){
        $data["err"] = "error: powUp isn't valid";
        unsetGame();
    }

    if($content["type"] === "rapidfire"){
        $_SESSION["player_cooldown"] = 12; // faster
    }

    if(!isset($data["err"])){
        $data["code"] =
        "var added = false;

        for(var i = 0; i < player.pows.length; i++){
            if(player.pows[i] == '" . $content['type'] . "'){
                player.pows_c[i] += " . $content['coold'] . ";
                
                added = true;

                break;
            }
        }
        
        if(added === false){
            player.pows.push('" . $content['type'] . "');
            player.pows_c.push(" . $content['coold'] . ");
        }
        
        powUpGUI(); ";
    
        $data["code"] .= "API('confirmAddPowUp');"; // confirm that code was evaled

        $_SESSION["confirmAddPowUp"] = false;
    }

    array_push($_SESSION["activePowUps"], $content["type"]);
    
    echo json_encode($data);
}
else if($action == "confirmAddPowUp"){
    $_SESSION["confirmAddPowUp"] = true;
}
else if($action == "deletePowUp"){
    if($content === "rapidfire"){
        $_SESSION["player_cooldown"] = 20; // default
    }
}
else if($action == "confirmPowUp"){
    sleep(1);
    if(in_array($content, $_SESSION["activePowUps"]) === false){
        echo "error: powUp isn't active";
        unsetGame();
    }
}
else if($action == "killEnemy"){
    // todo confirmation

    if($content == $_SESSION["wave"])
        $_SESSION["kills"]++;
    else
        $_SESSION["kills_additional"] = true; // last kill sometimes come to server when it's already new wave

    // pow-up

    $rand = rand(1, 2);

    if(isWavePow() && (($rand == 1 && $_SESSION["lastFullOppCount"] - $_SESSION["kills"] == 1) || $rand == 1)){
        echo 1;
        unPowWave();
        $_SESSION["powUpsToUse"]++;
    }
    else
        echo 0;
}
else if($action == "bulletAdd"){
    $_SESSION["bullets"]++;
}
else if($action == "bulletDel"){
    $_SESSION["bullets"]--;
}
else if($action == "flyBy"){
    if($content == "die"){
        $_SESSION["deadFlyByes"]++;
    }
}
else if($action == "error"){
    unsetGame();
}
else if($action == "ping"){
    echo "pong";
}
else if($action == "popup"){ // "create account" popup data collect
    $data = json_decode(file_get_contents("stat_data/createAccountPopUp.data"), true);

    if(!isset($data[$content])){
        $data[$content] = 0;
    }
    $data[$content]++;

    $data["closed"] = $data["open"] - $data["reg"] - $data["log"];

    file_put_contents("stat_data/createAccountPopUp.data", json_encode($data)); // as JSON
}

exit();

?>