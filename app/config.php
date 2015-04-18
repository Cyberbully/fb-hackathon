<?php
require_once __DIR__ . '/vendor/autoload.php';
use Facebook\FacebookSession;

FacebookSession::setDefaultApplication('794867827234077', 'a400da5218753a7d50cf9e44e1b581f0');
ParseClient::initialize('irepUXm37Mzk2XFwYxv4QO2DyYxEq1rRz7rDY3wY', 'nWVmmyGJosJ2XoAUiLF8uvJbECNPsRTGmxYDAl8v', 'C2N4yYCioohT24Me2iGTQlBmlGDdO7l2Ge18L7tg');

// TODO: redirect page instead of die.
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
        // Graph API returned info, but it may mismatch the current app or have expired.
        die $ex->getMessage();
    }
    return $session;
}
?>
