<?php
require_once __DIR__ . '/../app/vendor/autoload.php';
require_once '../app/config.php';

$app = new \Slim\Slim();

$app->get('/hello/:name', function ($name) {
    echo "Hello, $name, my name is Wayne Wobcke";
});

$app->run();

?>
