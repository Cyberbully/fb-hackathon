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

    if (!isset($data['event_id']) || !isset($data['start_date']) || !isset($data['days']) || !isset($data['frequency'])) {
        echo json_encode(array('ok' => false, 'error' => "Missing fields."));
        return;
    }  

    $event = new ParseObject('Event');
    $event->set('event_id', $data['event_id']);
    $event->set('start_date', $data['start_date']);
    $event->set('days', $data['days']);
    $event->set('frequency', $data['frequency']);
    $event->setAssociativeArray('times', []);
    $event->setAssociativeArray('entries', []);

    // post to event on facebook 
    $request = new FacebookRequest(
        $session,
        'POST',
        '/' . $data['event_id'] . '/feed',
        array (
            'message' => $GLOBALS["CREATE_MESSAGE"],
            'link' => $GLOBALS["EVENT_BASE_URL"] . $data['event_id'],
            'name' => $GLOBALS["POST_NAME"],
            'description' => $GLOBALS["POST_DESC"],
            'picture' => 'http://a4.urbancdn.com/w/s/Ob/1PMs50OPsKTpK4.jpg',
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
    session_start();
    $session = getSession();

    if (!$session) {        
        echo json_encode(array('ok' => false, 'error' => "Not logged in!"));
        return;
    }


    $query = new ParseQuery('Event');
    try {
        $query->equalTo("event_id", $event_id);
        $event = $query->first();
    } catch (ParseException $ex) {
        echo json_encode(array('ok' => false, 'error' => $ex->getMessage()));
        return;
    }

    // graph api request for user data
    try {
        $request = new FacebookRequest(
            $session,
            'GET',
            '/' . $event->get('event_id') . '?fields=id,name,owner,cover,place' 
        );
        $response = $request->execute();
        $event_data = $response->getResponse();
    } catch (FacebookRequestException $ex) {
        echo json_encode(array('ok' => false, 'error' => $ex->getMessage()));
        return;
    } catch (Exception $ex) {
        echo json_encode(array('ok' => false, 'error' => $ex->getMessage()));
        return;
    }

    echo json_encode(array('ok' => true, 'event' => array(
        'event_id' => $event->get('event_id'),
        'name' => $event_data->getProperty('name'),
        'location' => $event_data->getProperty('place'),
        'owner' => $event_data->getProperty('owner')->getProperty('id'),
        'start_date' => $event->get('start_date'),
        'days' => $event->get('days'),
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
            '/' . $facebookUser->getProperty('id') . '/events?fields=owner,id,name'
        );
        $response = $request->execute();
        $events = $response->getResponse();

        $event_array = [];
        foreach ($events->data as $event) {
            $query = new ParseQuery('Event');
            $query->equalTo('event_id', $event->id);
            if ($event->owner->id == $facebookUser->getProperty('id') && !$query->count()) {
                array_push($event_array, array("id" => $event->id, "name" => $event->name));
            }
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
    } catch (Exception $ex) {
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

            // remove if no longer positive
            if ($times[$entry] <= 0) {
                unset($times[$entry]);
            }
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
    $best_times = array_keys($times);
    usort($best_times, function ($a, $b) use ($times) {
        if ($times[$a] == $times[$b]) {
            if ($a == $b) {
                return 0;
            }
            return ($a < $b) ? -1 : 1;
        }
        return ($times[$a] < $times[$b]) ? 1 : -1;
    });

    $people_count = count($entries);

    $grouped_times = array();
    $current_group = array();
    $current_count = 0;

    foreach ($best_times as $time) {
        $count = $times[$time];

        if ($count != $current_count) {
            if ($current_count > 0) {
                array_push($grouped_times, array($current_group, $current_count));
                $current_group = array();
            }
            $current_count = $count;
        }

        array_push($current_group, $time);
    }
    if (count($current_group) > 0) {
        array_push($grouped_times, array($current_group, $current_count));
    }

    // post update to facebook event
    $update_msgs = array();
    foreach ($grouped_times as $times_tuple) {
        $times = $times_tuple[0];
        $count = $times_tuple[1];

        $best_times_str = array();
        foreach ($times as $time) {
            $s = strftime("%A %e %B %G, %l:%M%p", $time);

            array_push($best_times_str, $s);
        }

        $update_msg = "Good for $count/$people_count people:\n" . join("\n", $best_times_str);
        array_push($update_msgs, $update_msg);
    }

    $msg = join("\n\n", $update_msgs);

    $post_request = new FacebookRequest(
        $session,
        'POST',
        '/' . $event_id . '/feed',
        array (
            'message' => $msg,
            'link' => $GLOBALS["EVENT_BASE_URL"] . $event_id,
            'name' => $GLOBALS["POST_NAME"],
            'description' => $GLOBALS["POST_DESC"],
        )
    );

    try {
        // TODO: pagination
        $request = new FacebookRequest(
            $session,
            'GET',
            '/' . $facebookUser->getProperty('id') . '/events?fields=rsvp_status'
        );
        $response = $request->execute();
        $events = $response->getResponse();
        $rsvp = "invited";
        foreach ($events->data as $event_) {
            if ($event_->id == $event_id) {
                $rsvp = $event_->rsvp_status;
            }
        }

        if ($rsvp == "invited") {
            $requestMaybe = new FacebookRequest(
                $session,
                'POST',
                '/'. $event_id .'/maybe'
            );
            $responseMaybe = $requestMaybe->execute();
            $graphObject = $responseMaybe->getGraphObject();
        }

        $response = $post_request->execute();
        $event->save();
    } catch (ParseException $ex) {
        echo json_encode(array('ok' => false, 'error' => $ex->getMessage()));
        return;
    } catch (FacebookServerException $ex) {
        echo json_encode(array('ok' => false, 'error' => $ex->getMessage()));
        return;
    }

    echo json_encode(array('ok' => true, 'best_times' => $best_times));
});

$app->run();

?>
