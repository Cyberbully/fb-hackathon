<?php
require_once __DIR__ . '/../app/vendor/autoload.php';
require_once '../app/config.php';

use Parse\ParseClient;
use Parse\ParseObject;

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

$app->run();

?>
