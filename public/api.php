<?php
require_once __DIR__ . '/../app/vendor/autoload.php';
require_once '../app/config.php';

use Parse\ParseClient;
use Parse\ParseObject;
use Parse\ParseQuery;
use Facebook\FacebookSession;
use Facebook\FacebookRedirectLoginHelper;
use Facebook\FacebookRequest;
use Facebook\FacebookResponse;
use Facebook\FacebookSDKException;
use Facebook\FacebookRequestException;
use Facebook\FacebookAuthorizationException;
use Facebook\GraphObject;
header('Access-Control-Allow-Origin: http://localhost:8000');

$app = new \Slim\Slim();

$app->get('/api/hello/:name', function ($name) {
    echo 'Hello, $name, my name is Wayne Wobcke';
});

$app->post('/api/create', function() use ($app) {
    $data = json_decode($app->request()->getBody(), true);
     
    $event = new ParseObject('Event');
    $event->set('event_id', $data['event_id']);
    $event->set('start_time', $data['start_time']);
    $event->set('end_time', $data['end_time']);
    $event->set('frequency', $data['frequency']);
    $event->setAssociativeArray('times', []);
    $event->setAssociativeArray('entries', []);

    try {
        $event->save();
    } catch (ParseException $ex) {
        echo json_encode(array('ok' => false, 'error' => $ex->getMessage()));
        return;
    }

    echo json_encode(array('ok' => true, 'event_id'=>$data['event_id']));
});

$app->get('/api/event/:event_id', function($event_id) {
    $query = new ParseQuery('Event');
    try {
        $query->equalTo("event_id", $event_id);
        $event = $query->first();
    } catch (ParseException $ex) {
        echo json_encode(array('ok' => false, 'error' => $ex->getMessage()));
        return;
    }

    echo json_encode(array('ok' => true, 'event' => array(
        'event_id' => $event->get('event_id'),
        'start_time' => $event->get('start_time'),
        'end_time' => $event->get('end_time'),
        'frequency' => $event->get('frequency'),
        'times' => $event->get('times'),
        'entries' => $event->get('entries'),
    ))); 
});

$app->get('/api/details', function() {
    session_start();
    $session = getSession();

    if (!$session) {        
        echo json_encode(array('ok' => false, 'error' => "Not logged in!"));
        return;
    }
     
    // graph api request for user data
    try {
        $request = new FacebookRequest($session, 'GET', '/me');
        $response = $request->execute();
        $facebookUser = $response->getGraphObject(); 

        $request2 = new FacebookRequest(
              $session,
              'GET',
              '/' . $facebookUser->getProperty('id') . '/picture?redirect=False'
          );
        $response2 = $request2->execute();
        $facebookProfilePic = $response2->getGraphObject();
    } catch (FacebookRequestException $ex) {
        echo json_encode(array('ok' => false, 'error' => $ex->getMessage()));
        return;
    } catch (Exception $ex) {
        echo json_encode(array('ok' => false, 'error' => $ex->getMessage()));
        return;
    }

    echo json_encode(array('ok' => true, 'user' => array(
        'name' => $facebookUser->getProperty('name'),
        'profile' => $facebookProfilePic->getProperty('url'),
        'id' => $facebookUser->getProperty('id')
    )));
});

$app->post('/api/event/:event_id/preference', function($event_id) use ($app) {
    $data = json_decode($app->request()->getBody(), true);

    $query = new ParseQuery('Event');
    try {
        $query->equalTo("event_id", $event_id);
        $event = $query->first();
    } catch (ParseException $ex) {
        echo json_encode(array('ok' => false, 'error' => $ex->getMessage()));
        return;
    }

    $times = $event->get('times');
    $entries = $event->get('entries');

    $event->set('times', $times);
    $event->set('entries', $entries);

    try {
        $event->save();
    } catch (ParseException $ex) {
        echo json_encode(array('ok' => false, 'error' => $ex->getMessage()));
        return;
    }

    echo json_encode(array('ok' => true));
});

$app->run();

?>
