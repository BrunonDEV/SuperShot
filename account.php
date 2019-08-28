<?php

session_start();

$action = $_GET["action"];

if($action == "reg"){
    $username = "";
    $email    = "";
    $errors = array(); 

    // connect
    include("db.php");

    // receive all input values from the form
    $username = mysqli_real_escape_string($db, $_POST['username']);
    $email = mysqli_real_escape_string($db, $_POST['email']);
    $password_1 = $_POST['password_1'];
    $password_2 = $_POST['password_2'];

    if (empty($username)) { array_push($errors, "Username is required"); }
    if (empty($email)) { array_push($errors, "Email is required"); }
    if (empty($password_1)) { array_push($errors, "Password is required"); }
    if ($password_1 != $password_2) {
        array_push($errors, "The two passwords do not match");
    }

    $user_check_query = "SELECT * FROM USERS WHERE user='$username' OR email='$email' LIMIT 1";
    $result = mysqli_query($db, $user_check_query);

    if($result === FALSE)
        die(mysqli_error($db));

    $user = mysqli_fetch_assoc($result);
    
    if ($user) { // if user exists
        if ($user['user'] === $username) {
            array_push($errors, "Username already exists");
        }

        if ($user['email'] === $email) {
            array_push($errors, "Email already exists");
        }
    }

    if(filter_var($email, FILTER_VALIDATE_EMAIL) == FALSE) {
        array_push($errors, "Email is not valid");
    }
    
    if(strlen($username) < 2){
        array_push($errors, "Username needs to be at least 2 characters long");
    }

    if(strlen($username) > 14){
        array_push($errors, "Username needs to be less than 14 characters long");
    }

    if(strlen($password_1) < 5){
        array_push($errors, "Password needs to be at least 5 characters long");
    }

    /*if(!isset($_POST['accept_terms'])){
        array_push($errors, "You have to accept terms of use");
    }*/
    
    // register user if there are no errors in the form
    if (count($errors) == 0) {
        $password = md5($password_1); // encrypt the password before saving

        $active = intval(false);
        $best = intval(0);

        $token = md5(uniqid($username, true));

        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= 'From: <noreply@supershot.pro>' . "\r\n";
        
        $info .= "We will not send you any further e-mails.";

        $res = mail($email, "SuperShot -- Confirm your account", "<b>Click this link to confirm your account:</b> http://supershot.pro/confirm.php?token=" . $token . "<br />Thank you for joining us, " . $username . "!<br /><br />" . $info, $headers);

        if($res == false)
            die("mail err");

        $query = "INSERT INTO USERS (user, email, password, acc_email, best, email_token) 
                VALUES('$username', '$email', '$password', '$active', '$best', '$token')";
        mysqli_query($db, $query);
        $_SESSION['username'] = $username;
        header('location: ./?reg');
    }
    else{
        $_SESSION['errors'] = $errors;
        header('location: ./');
    }

    exit();
}
else if($action == "log"){
    // connect
    include("db.php");

    $errors = array();

    $username = mysqli_real_escape_string($db, $_POST['login']);
    $password = mysqli_real_escape_string($db, $_POST['password']);
    
    if (empty($username)) {
        array_push($errors, "Username is required");
    }
    if (empty($password)) {
        array_push($errors, "Password is required");
    }
    
    if (count($errors) == 0) {
        $password = md5($password);
        $query = "SELECT * FROM USERS WHERE user='$username' AND password='$password'";
        $results = mysqli_query($db, $query);
        if (mysqli_num_rows($results) == 1) {
            $_SESSION['username'] = $username;
            $_SESSION['best'] = mysqli_fetch_assoc($results)['best'];
            header('location: ./');
        }else {
            array_push($errors, "Wrong username/password combination");
            $_SESSION['errors'] = $errors;
            header('location: ./');
        }
    }
    exit();
}

?>