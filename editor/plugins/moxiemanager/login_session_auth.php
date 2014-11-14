<?php
session_start();

	// Some settings
	$msg = "";
	$username = "demo";
	$password = ""; // Change the password to something suitable

	if (!$password)
		$msg = 'You must set a password in the file "login_session_auth.php" inorder to login using this page or reconfigure it the authenticator config options to fit your needs. Consult the <a href="http://wiki.moxiecode.com/index.php/Main_Page" target="_blank">Wiki</a> for more details.';

	if (isset($_POST['submit_button'])) {
		// If password match, then set login
		if ($_POST['login'] == $username && $_POST['password'] == $password && $password) {
			// Set session
			session_start();
			$_SESSION['isLoggedIn'] = true;
			$_SESSION['user'] = $_POST['login'];

			// Override any config option
			//$_SESSION['imagemanager.filesystem.rootpath'] = 'some path';
			//$_SESSION['filemanager.filesystem.rootpath'] = 'some path';

			// Redirect
			header("location: " . $_POST['return_url']);
			die;
		} else
			$msg = "Wrong username/password.";
	}
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=7" />
        <meta name="SKYPE_TOOLBAR" content="SKYPE_TOOLBAR_PARSER_COMPATIBLE" />
        <title>Infoweb</title>
    </head>
    <body>
        <ul>
            <li>Your sessions has terminated. Please log in again.</li>
            <li>Uw sessie is beëindigd. Gelieve opnieuw in te loggen.</li>
            <li>Vos sessions a pris fin. S'il vous plaît vous connecter à nouveau.</li>
        </ul>
    </body>
</html>
