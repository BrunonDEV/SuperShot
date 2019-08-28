<?php

session_start();

$token = $_GET["token"];

include("db.php");

$active = intval(true);

$token = mysqli_real_escape_string($db, $token); // injection prevention

$query = "UPDATE USERS SET acc_email='$active' WHERE email_token='$token'";

if(mysqli_query($db, $query) == FALSE){
    $_SESSION['errors'] = array();
    array_push($_SESSION['errors'], "Something went wrong, try again later");

    header("location: ./");
}
else;
    header("location: ./?con");

exit();

?>