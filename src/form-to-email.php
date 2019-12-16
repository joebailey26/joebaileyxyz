<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {	
    $recaptcha_url = 'https://www.google.com/recaptcha/api/siteverify';
    $recaptcha_secret = '6LcLDYgUAAAAAC-PtByGbUJnt4yplK7z3SA31WoL';
    $recaptcha_response = $_POST['recaptcha_response'];

    $recaptcha = file_get_contents($recaptcha_url . '?secret=' . $recaptcha_secret . '&response=' . $recaptcha_response);
    $recaptcha = json_decode($recaptcha);

	if ($recaptcha->score >= 0.5) {
		$name = $_POST['name'];
		$visitor_email = $_POST['email'];
		$subject = $_POST['subject'];
		
		// Check that data was sent to the mailer.
		if ( empty($name)  OR empty($subject) OR !filter_var($visitor_email, FILTER_VALIDATE_EMAIL)) {
			echo "Oops! There was a problem with your submission. Please try again.";
			exit;
		}
		
		$email_subject = "Joe Bailey Contact Form";
		$email_body = "You have received a new message from $name.\n".
		"Here is the message:\n".
		"$subject\n".
		$to = "joe@joebailey.xyz";
		$headers = "From: $visitor_email \r\n";
		mail($to,$email_subject,$email_body,$headers);
		echo 'Thank you for your message';
	}
	else {
		echo 'I\'m sorry, we couldn\'t verify that you are human. Please try again.';
	}
}
?>