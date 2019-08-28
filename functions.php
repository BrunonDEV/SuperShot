<?php

session_start();

define("LVL_EXP_MULT", 25);

function checkSession(){
    if(!isset($_SESSION["username"])){
        /*$_SESSION["errors"] = array();
        array_push($_SESSION["errors"], "Session expired.");

        header("location: logout.php");*/

        exit();
    }
}

function getVar($what){
    if($what === "best"){
        if(isset($_SESSION['username'])){
            include("db.php");
    
            $user = $_SESSION['username'];
            $user = mysqli_real_escape_string($db, $user);
    
            $query = "SELECT * FROM USERS WHERE user='$user'";
    
            $results = mysqli_query($db, $query);
    
            return mysqli_fetch_assoc($results)['best'];
        }
        else{
            if(isset($_COOKIE["best"])){
                return $_COOKIE["best"];
            }
            else
                return 0;
        }
    }
    else if($what === "lvl"){
        return $_SESSION["userData"]["lvl"];
    }
    else if($what === "exp"){
        return $_SESSION["userData"]["exp"];
    }
    else if($what == "req_exp"){
        return $_SESSION["userData"]["lvl"] * LVL_EXP_MULT;
    }
    else if($what == "maxHP"){
        return $_SESSION["userData"]["maxHP"];
    }
}

function saveBest($score){
    if(isset($_SESSION["username"])){ // to the database
        include("db.php");
        checkSession();

        $user = $_SESSION['username'];
        $query = "UPDATE USERS SET best='$score' WHERE user='$user'";

        return mysqli_query($db, $query);
    }
    else{ // to a cookie
        setcookie(
            "best",
            $score,
            time() + (10 * 365 * 24 * 60 * 60)
        );
    }
}

function saveVars(){
    $data = $_SESSION["userData"];

    if(isset($_SESSION["username"])){ // to a file
        file_put_contents("users/" . $_SESSION["username"] . ".data", json_encode($data)); // as JSON
    }
    else{ // to cookies
        setcookie(
            "user_data",
            json_encode($data),
            time() + (10 * 365 * 24 * 60 * 60)
        );
    }
}

function loadVars(){
    if(isset($_SESSION["username"])){ // from a file
        $_SESSION["userData"] = json_decode(file_get_contents("users/" . $_SESSION["username"] . ".data"), true);
    }
    else{ // from cookies
        if(isset($_COOKIE["user_data"]))
            $_SESSION["userData"] = json_decode($_COOKIE["user_data"], true);
    }

    if(count($_SESSION["userData"]) < 2 || !isset($_SESSION["userData"])){
        $_SESSION["userData"] = array();

        // FIRST-TIME SET USER VARIABLES !!!

        $_SESSION["userData"]["lvl"] = 1;
        $_SESSION["userData"]["exp"] = 0;
    }

    if($_SESSION["userData"]["maxHP"] != 100 + $_SESSION["userData"]["lvl"] * 5 - 5)
        $_SESSION["userData"]["maxHP"] = 100 + $_SESSION["userData"]["lvl"] * 5 - 5;
}

function processVars($score){
    $oldexp = $_SESSION["userData"]["exp"];
    $exp;

    if($_SESSION["startwave"] != 0 && isset($_SESSION["startwave"])){
        $rel_score = $score - ($_SESSION["startwave"] - 1);
    }
    else
        $rel_score = $score;

    if($score <= 25)
        $_SESSION["userData"]["exp"] += $rel_score - 1; // exp += score - 1
    else{

        if($_SESSION["startwave"] != 25){
            $_SESSION["userData"]["exp"] += 24; // from first 25 waves
            $_SESSION["userData"]["exp"] += ($rel_score - 25 - 1) * 2; // 25+ score is *2
        }
        else
            $_SESSION["userData"]["exp"] += ($rel_score - 1) * 2;
    }
    
    $exp =  $_SESSION["userData"]["exp"];

    if($_SESSION["userData"]["exp"] >= $_SESSION["userData"]["lvl"] * LVL_EXP_MULT){ // exp > required exp
        $_SESSION["userData"]["exp"] -= $_SESSION["userData"]["lvl"] * LVL_EXP_MULT; // exp -= required exp
        $_SESSION["userData"]["lvl"]++; // lvl++
        $_SESSION["userData"]["maxHP"] += 5;
    }

    $_SESSION["added_exp"] = $exp - $oldexp; // difference

    saveVars();
}

function setGame(){
    $_SESSION["wave"] = 1;
    $_SESSION["HP"] = $_SESSION["userData"]["maxHP"];
    $_SESSION["opp"] = 0;
    $_SESSION["powUpsToUse"] = 0;

    $_SESSION["startwave"] = 0;

    $_SESSION["player_cooldown"] = 20;

    $_SESSION["tenth"] = 1;
    $_SESSION["fifth"] = 1;
    $_SESSION["fifth2"] = 1;
    $_SESSION["fifth3"] = 1;
    $_SESSION["second"] = 1;
    $_SESSION["second2"] = 1;
    $_SESSION["second3"] = 1;

    $_SESSION["kills"] = 0;
    $_SESSION["lastFullOppCount"] = 0;
    $_SESSION["kills_additional"] = true;
    $_SESSION["bullets"] = 0;

    $_SESSION["lastFlyByes"] = 0;
    $_SESSION["deadFlyByes"] = 0;

    $_SESSION["confirmWave"] = true;
    $_SESSION["confirmAddPowUp"] = true;
    $_SESSION["activePowUps"] = array();

    unset($_SESSION["factors"]);
}

function unsetGame(){
    unset($_SESSION["wave"]);
}

function isWavePow(){
    for($i = 0; $i < count($_SESSION["powWaves"]); $i++){
        if($_SESSION["powWaves"][$i] == $_SESSION["wave"]){
            return true;
        }
    }
    return false;
}

function unPowWave(){
    for($i = 0; $i < count($_SESSION["powWaves"]); $i++){
        if($_SESSION["powWaves"][$i] == $_SESSION["wave"]){
            array_splice($_SESSION["powWaves"], $i, 1);
            return true;
        }
    }
    return false; // err
}

function clean($string) {
    return preg_replace('/[^A-Za-z0-9\-]/', '', $string); // removes special chars
}

function skipToWave($wave){ // works only to wave 50 (TODO)
    $_SESSION["startwave"] = $wave;
    
    for($i = 1; $i < $wave; $i++){
        $_SESSION["wave"] = $i;
        processFactors();
    }
}

function processFactors(){
    // !! opp (opponents count)

    if($_SESSION["wave"] == 1)
        $_SESSION["opp"]++; // 1

    if($_SESSION["wave"] == 2)
        $_SESSION["opp"] += 2; // 3

    if($_SESSION["wave"] == 10)
        $_SESSION["opp"]++; // 4

    if($_SESSION["wave"] == 20)
        $_SESSION["opp"]++; // 5

    if($_SESSION["wave"] == 50)
        $_SESSION["opp"]++; // 6

    $data["opp"] = $_SESSION["opp"]; // "static" count

    // random added count:

    if($_SESSION["wave"] > 5 && $_SESSION["wave"] < 20)
        $data["opp"] += rand(0, 1); // 2-3, 3-4

    if($_SESSION["wave"] > 75)
        $data["opp"] += rand(0, 1); // 5-6

    $_SESSION["lastFullOppCount"] = $data["opp"];

    // !! factors

    if($_SESSION["wave"] % 10 == 0){
        $_SESSION["tenth"]++;
    }
    if($_SESSION["wave"] % 5 == 0){
        $_SESSION["fifth"]++;
    }
    if($_SESSION["wave"] % 2 == 0){
        $_SESSION["second"]++;
    }

    $speedfactor = 1.5 + ($_SESSION["second"] * 0.25);
    $powerfactor = 1.5 + ($_SESSION["fifth"] * 0.25);

    $sf1 = $speedfactor;
    $pf1 = $powerfactor;

    if($sf1 > 3){
        $sf1 = 3;

        $sf1 += $_SESSION["second2"] * 0.12;

        if($_SESSION["wave"] % 2 == 0)
            $_SESSION["second2"]++;
    }
    if($pf1 > 3){
        $pf1 = 3;

        $pf1 += $_SESSION["fifth2"] * 0.12;

        if($_SESSION["wave"] % 5 == 0)
            $_SESSION["fifth2"]++;
    }

    if($sf1 >= 5){
        $sf1 = 5;

        $sf1 += $_SESSION["second3"] * 0.05;

        if($_SESSION["wave"] % 2 == 0)
            $_SESSION["second3"]++;
    }
    if($pf1 >= 5){
        $pf1 = 5;

        $pf1 += $_SESSION["fifth3"] * 0.05;

        if($_SESSION["wave"] % 5 == 0)
            $_SESSION["fifth3"]++;
    }

    $sf2 = $speedfactor - 2.6; // on wave 25 it's 1
    $pf2 = $powerfactor - 1.2; // -||-

    if($sf2 > 1.5)
        $sf2 = 1.5;
    if($pf2 > 2.5)
        $pf2 = 2.5;

    $bomb_coold = 160 - $_SESSION["fifth"] * 10;

    if($bomb_coold < 85)
        $bomb_coold = 85;

    $data["factors"] = array();

    $_SESSION["factors"]["sf1"] = $data["factors"]["sf1"] = $sf1;
    $_SESSION["factors"]["pf1"] = $data["factors"]["pf1"] = $pf1;

    $_SESSION["factors"]["sf2"] = $data["factors"]["sf2"] = $sf2;
    $_SESSION["factors"]["pf2"] = $data["factors"]["pf2"] = $pf2;

    $_SESSION["factors"]["bomb_coold"] = $data["factors"]["bomb_coold"] = $bomb_coold;

    return $data;
}

function recurse_copy($src, $dst){
    $dir = opendir($src); 
    @mkdir($dst); 
    while(false !== ( $file = readdir($dir)) ) { 
        if (( $file != '.' ) && ( $file != '..' )) { 
            if ( is_dir($src . '/' . $file) ) { 
                recurse_copy($src . '/' . $file,$dst . '/' . $file); 
            } 
            else { 
                copy($src . '/' . $file,$dst . '/' . $file); 
            } 
        } 
    }
    closedir($dir);
}

?>