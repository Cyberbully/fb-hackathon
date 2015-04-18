<?php
require_once __DIR__ . '/../app/vendor/autoload.php';
require_once '../app/config.php';

use Facebook\FacebookSession;
use Facebook\FacebookRedirectLoginHelper;
use Facebook\FacebookRequest;
use Facebook\FacebookResponse;
use Facebook\FacebookSDKException;
use Facebook\FacebookRequestException;
use Facebook\FacebookAuthorizationException;
use Facebook\GraphObject;

// start session
session_start();

// login helper with redirect_uri
$loginUrl = $GLOBALS["LOGIN_URL"];
if (isset($_GET["event"])) {
    $loginUrl = $GLOBALS["EVENT_BASE_URL"] . $_GET["event"];
}
$helper = new FacebookRedirectLoginHelper($loginUrl);

$session = getSession();
if (!$session) {
    try {
        $session = $helper->getSessionFromRedirect();
    } catch (FacebookRequestException $ex) {
    } catch (Exception $ex) {
    }

    if ($session) {
        $_SESSION["fb-auth"] = $session->getToken();
        if (isset($_GET["event"])) {
            header("Location: /#/pick?event=" . $_GET["event"]);
        } else {
            header("Location: /#");
        }
        exit();
    }
}

// see if we have a session
if ($session) {
    if (isset($_GET["event"])) {
        header("Location: /#/pick?event=" . $_GET["event"]);
        exit();
    }
    include('index.html');
} else {
    // show login url
    header("Location: " . $helper->getLoginUrl( array('publish_actions', 'user_events', 'rsvp_event') ));
}

?>
