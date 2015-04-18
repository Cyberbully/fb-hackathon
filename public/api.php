<?php
require_once __DIR__ . '/../app/vendor/autoload.php';
require_once '../app/config.php';

use Parse\ParseClient;
use Parse\ParseObject;
use Parse\ParseQuery;

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

$app->run();

?>
