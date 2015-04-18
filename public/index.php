<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once 'config.php';

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
$helper = new FacebookRedirectLoginHelper('http://fb.jcaw.me/fb/public/index.php');

try {
  $session = $helper->getSessionFromRedirect();
} catch( FacebookRequestException $ex ) {
  // When Facebook returns an error
} catch( Exception $ex ) {
  // When validation fails or other local issues
}

// see if we have a session
if (isset($session)) {
  // graph api request for user data
  $request = new FacebookRequest( $session, 'GET', '/me' );
  $response = $request->execute();
  // get response
  $graphObject = $response->getGraphObject();

  // print data
  echo '<pre>' . print_r( $graphObject, 1 ) . '</pre>';

  $_SESSION["fb-auth"] = $session->getToken();
} else {
  // show login url
  echo '<a href="' . $helper->getLoginUrl() . '">Login</a>';
}

?>
