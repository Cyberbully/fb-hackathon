<?php
require_once __DIR__ . '/../app/vendor/autoload.php';
require_once '../app/config.php';

use Parse\ParseClient;
use Parse\ParseObject;
use Facebook\FacebookRedirectLoginHelper;
use Facebook\FacebookRequest;
use Facebook\FacebookResponse;

$app = new \Slim\Slim();

$app->get('/api/hello/:name', function ($name) {
    echo "Hello, $name, my name is Wayne Wobcke";
});

$app->post('/api/create', function() use ($app) {
    $data = json_decode($app->request()->getBody(), true);
    
    $eventTable = new ParseObject("EventTable");
    $eventTable->set("event_id", $data["event_id"]);
    $eventTable->set("start_time", $data["start_time"]);
    $eventTable->set("end_time", $data["end_time"]);
    $eventTable->set("frequency", $data["frequency"]);
    $eventTable->setAssociativeArray("times", []);
    $eventTable->setAssociativeArray("entries", []);

    try {
        $eventTable->save();
    } catch (ParseException $ex) {
        $reply = array('ok' => false, 'error' => $ex->getMessage());
        echo json_encode($reply);
        return;
    }

    $reply = array('ok' => true, 'event_id'=>$data["event_id"]);
    echo json_encode($reply);
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
