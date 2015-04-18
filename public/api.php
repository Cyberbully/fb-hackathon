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
use Facebook\FacebookServerException;
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

    $query = new ParseQuery('Event');
    try {
        $query->equalTo("event_id", $data["event_id"]);
        $count = $query->count();
    } catch (ParseException $ex) {
        echo json_encode(array('ok' => false, 'error' => $ex->getMessage()));
        return;
    }
    if ($count > 0) {
        echo json_encode(array('ok' => false, 'error' => "Event already exists!"));
        return;
    }

    if (!isset($data['event_id']) || !isset($data['start_time']) || !isset($data['end_time']) || !isset($data['frequency'])) {
        echo json_encode(array('ok' => false, 'error' => "Missing fields."));
        return;
    }  

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
            'message' => "Greetings, friends! Let's find the best time for our event, indicate your preferred times here",
            /*'link' => $EVENT_BASE_URL . $data['event_id'],
            'name' => 'Time for Hoh Won',
            'description' => 'Choose which times are best for you',
            'picture' => 'http://a4.urbancdn.com/w/s/Ob/1PMs50OPsKTpK4.jpg',*/
        )
    );
    //$graphObject = $response->getGraphObject();

    try {
        $response = $request->execute();
        $event->save();
    } catch (ParseException $ex) {
        echo json_encode(array('ok' => false, 'error' => $ex->getMessage()));
        return;
    } catch (FacebookServerException $ex) {
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
            array_push($event_array, array("id" => $event->id, "name" => $event->name));
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

    // determine best timeslots (TODO)
    $best_times = array();
    $max_count = 0;

    foreach ($times as $time => $count) {
        if ($count == $max_count) {
            array_push($best_times, $time);
        } else if ($count > $max_count) {
            $best_times = array( $time );
            $max_count = $count;
        }
    }

    // post update to facebook event
    $best_times_str = array();
    foreach ($best_times as $time) {
        $day = intval(strftime("%e"));
        $s = strftime("%A %e$day %B %G, %l:%M%p");

        array_push($best_times_str, $s);
    }
    $update_msg = "New best times:\n" . join("\n", $best_times_str);

    $request = new FacebookRequest(
        $session,
        'POST',
        '/' . $data['event_id'] . '/feed',
        array (
            'message' => $update_msg,
        )
    );

    try {
        $event->save();
    } catch (ParseException $ex) {
        echo json_encode(array('ok' => false, 'error' => $ex->getMessage()));
        return;
    }

    echo json_encode(array('ok' => true, 'best_times' => $best_times));
});

$app->run();

?>
