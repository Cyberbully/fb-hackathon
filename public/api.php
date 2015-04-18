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
    echo "<pre>Hello, $name, my name is Wayne Wobcke</pre>";
    echo '<img src="http://www.cse.unsw.edu.au/~wobcke/wobcke.jpeg">';
});

$app->post('/api/create', function() use ($app) {
    session_start();
    $session = getSession();

    if (!$session) {        
        echo json_encode(array('ok' => false, 'error' => "Not logged in!"));
        return;
    }

    $data = json_decode($app->request()->getBody(), true);
     
    $event = new ParseObject('Event');
    $event->set('event_id', $data['event_id']);
    $event->set('start_time', $data['start_time']);
    $event->set('end_time', $data['end_time']);
    $event->set('frequency', $data['frequency']);
    $event->setAssociativeArray('times', []);
    $event->setAssociativeArray('entries', []);

    // post to event on facebook 
    $request = new FacebookRequest(
        $session,
        'POST',
        '/' . $data['event_id'] . '/feed',
        array (
            'message' => "Greetings, friends! Let's find the best time for our event",
            'link' => $EVENT_BASE_URL . $data['event_id'],
            'name' => 'Time for Hoh Won',
            'description' => 'Choose which times are best for you',
            'picture' => 'http://a4.urbancdn.com/w/s/Ob/1PMs50OPsKTpK4.jpg',
        )
    );
    $response = $request->execute();
    $graphObject = $response->getGraphObject();

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

        $request = new FacebookRequest(
              $session,
              'GET',
              '/' . $facebookUser->getProperty('id') . '/picture?redirect=False'
          );
        $response = $request->execute();
        $facebookProfilePic = $response->getGraphObject();

        $request = new FacebookRequest(
            $session,
            'GET',
            '/' . $facebookUser->getProperty('id') . '/events'
        );
        $response = $request->execute();
        $events = $response->getResponse();

        $event_array = [];
        foreach ($events->data as $event) {
            $event_array[$event->id] = $event->name; 
        }
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
        'id' => $facebookUser->getProperty('id'),
        'events' => $event_array
    )));
});

$app->post('/api/event/:event_id/preference', function($event_id) use ($app) {
    session_start();
    $session = getSession();

    if (!$session) {        
        echo json_encode(array('ok' => false, 'error' => "Not logged in!"));
        return;
    }
     
    $data = json_decode($app->request()->getBody(), true);

    $query = new ParseQuery('Event');
    try {
        $query->equalTo("event_id", $event_id);
        $event = $query->first();
    } catch (ParseException $ex) {
        echo json_encode(array('ok' => false, 'error' => $ex->getMessage()));
        return;
    }
    try {
        $request = new FacebookRequest($session, 'GET', '/me');
        $response = $request->execute();
        $facebookUser = $response->getGraphObject(); 
    } catch (FacebookRequestException $ex) {
        echo json_encode(array('ok' => false, 'error' => $ex->getMessage()));
        return;
    } catch (Exception $ex) {
        echo json_encode(array('ok' => false, 'error' => $ex->getMessage()));
        return;
    }

    $times = $event->get('times');
    $entries = $event->get('entries');

    // Decrement all current ones.
    if (isset($entries[$facebookUser->getProperty('id')])) {
        foreach ($entries[$facebookUser->getProperty('id')] as $entry) {
            $times[$entry]--;
        }
    }

    $entries[$facebookUser->getProperty('id')] = [];
    foreach ($data["preferences"] as $preference) {
        if (!isset($times[$preference])) {
            $times[$preference] = 0;
        }
        $times[$preference]++;
        array_push($entries[$facebookUser->getProperty('id')], $preference);
    }
        
    $event->setAssociativeArray('times', $times);
    $event->setAssociativeArray('entries', $entries);

    try {
        $event->save();
    } catch (ParseException $ex) {
        echo json_encode(array('ok' => false, 'error' => $ex->getMessage()));
        return;
    }

    echo json_encode(array('ok' => true));
});

$app->post('/api/create2', function() use ($app) {
    $data = json_decode($app->request()->getBody(), true);

    $eventID = $data['event_id'];

    session_start();
    $session = getSession();
    if (!$session) {
        echo "no session 4 u";
        return;
    }

    $request = new FacebookRequest(
        $session,
        'POST',
        '/' . $eventID . '/feed',
        array (
            'message' => 'here is a test message',
        )
    );
    $response = $request->execute();
    $graphObject = $response->getGraphObject();
});

$app->run();

?>
