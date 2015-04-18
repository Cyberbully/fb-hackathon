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
$helper = new FacebookRedirectLoginHelper($LOGIN_URL);

$session = getSession();
if (!$session) {
    try {
        $session = $helper->getSessionFromRedirect();
    } catch (FacebookRequestException $ex) {
    } catch (Exception $ex) {
    }

    if ($session) {
        $_SESSION["fb-auth"] = $session->getToken();
        echo "saved session token: " . $session->getToken() . "\n";
    }
}

// see if we have a session
if ($session) {
    // TODO: redirect.
    
    // graph api request for user data
    $request = new FacebookRequest( $session, 'GET', '/me' );
    $response = $request->execute();
    // get response
    $graphObject = $response->getGraphObject();

    // print data
    echo '<pre>' . print_r( $graphObject, 1 ) . '</pre>';
} else {
    // show login url
    echo '<a href="' . $helper->getLoginUrl( array('publish_actions', 'user_events') ) . '">Login</a>';
}

?>
