// Google Sign-In Integration
// The button is automatically rendered by Google's library using the HTML data attributes

// Handle Google Sign-In response - must be globally accessible
function handleGoogleSignIn(response) {
    console.log('Google Sign-In callback triggered');

    const credential = response.credential;

    // Decode the JWT token to get user info
    try {
        const payload = JSON.parse(atob(credential.split('.')[1]));
        console.log('User authenticated:', payload);

        // Show success message with user details
        alert(`Welcome ${payload.name}!\n\nEmail: ${payload.email}\n\nYou have successfully signed in with Google!`);

        // Store user info in localStorage
        localStorage.setItem('userEmail', payload.email);
        localStorage.setItem('userName', payload.name);
        localStorage.setItem('userPicture', payload.picture);
        localStorage.setItem('googleCredential', credential);

        // Redirect to home page after 1.5 seconds
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);

    } catch (error) {
        console.error('Error processing Google Sign-In:', error);
        alert('Failed to sign in with Google. Please try again.');
    }
}

// Make the function globally available for Google's callback
window.handleGoogleSignIn = handleGoogleSignIn;

console.log('Google auth handler loaded');
