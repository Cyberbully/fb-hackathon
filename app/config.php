<?php
require_once __DIR__ . '/vendor/autoload.php';
use Facebook\FacebookSession;
use Parse\ParseClient;

$HOST = "localhost";

$LOGIN_URL = "http://" . $HOST . "/index.php";

FacebookSession::setDefaultApplication('794918943895632', 'ea9cca1cd754446cb4dfe77affdf590f');
ParseClient::initialize('irepUXm37Mzk2XFwYxv4QO2DyYxEq1rRz7rDY3wY', 'nWVmmyGJosJ2XoAUiLF8uvJbECNPsRTGmxYDAl8v', 'C2N4yYCioohT24Me2iGTQlBmlGDdO7l2Ge18L7tg');

function getSession() {
    if (!isset($_SESSION['fb-auth'])) {
        return null;        
    }
    $session = new FacebookSession($_SESSION['fb-auth']);
    try {
        $session->validate();
    } catch (FacebookRequestException $ex) {
        return null;
    } catch (\Exception $ex) {
        return null;
    }
    return $session;
}
?>
