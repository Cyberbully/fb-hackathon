<?php
require_once __DIR__ . '/vendor/autoload.php';
use Facebook\FacebookSession;
use Parse\ParseClient;

$HOST = "fb.jcaw.me";

$LOGIN_URL = "http://" . $HOST . "/";
//$EVENT_BASE_URL = "http://" . $HOST . "/event/";

FacebookSession::setDefaultApplication('794867827234077', 'a400da5218753a7d50cf9e44e1b581f0');
ParseClient::initialize('irepUXm37Mzk2XFwYxv4QO2DyYxEq1rRz7rDY3wY', 'nWVmmyGJosJ2XoAUiLF8uvJbECNPsRTGmxYDAl8v', 'C2N4yYCioohT24Me2iGTQlBmlGDdO7l2Ge18L7tg');

date_default_timezone_set("Australia/Sydney");

function getSession() {
    if (!isset($_SESSION['fb-auth'])) {
        return null;        
    }
    $session = new FacebookSession($_SESSION['fb-auth']);
    try {
        $session->validate();
    } catch (FacebookRequestException $ex) {
        return null;
    } catch (\Exception $ex) {
        return null;
    }
    return $session;
}
?>
