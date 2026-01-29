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

        // Validate and Login with Backend
        fetch('/api/auth/google-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: payload.email,
                name: payload.name,
                picture: payload.picture
            })
        })
            .then(res => {
                if (res.status === 403) {
                    throw new Error("Google Login is disabled for Admin/Center accounts.");
                }
                if (!res.ok) {
                    throw new Error("Server login failed.");
                }
                return res.json();
            })
            .then(data => {
                // Success - Proceed
                console.log("Google Login Success, DB User:", data.user);

                // Show success message with user details
                alert(`Welcome ${data.user.name}!\n\nEmail: ${data.user.email}\n\nYou have successfully signed in with Google!`);

                // Store user info in localStorage
                // Standardize with Unified Login keys
                localStorage.setItem('app_user_id', data.user.user_id);
                localStorage.setItem('app_user_email', data.user.email);
                localStorage.setItem('app_user_role', 'USER');
                localStorage.setItem('app_user_name', data.user.name);

                // Legacy keys (keep for compatibility)
                localStorage.setItem('userId', data.user.user_id);
                localStorage.setItem('userEmail', data.user.email);
                localStorage.setItem('userName', data.user.name);
                localStorage.setItem('userPicture', data.user.profile_picture);
                localStorage.setItem('googleCredential', credential);
                localStorage.setItem('userRole', 'USER');

                // Redirect to home page after 1.5 seconds
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            })
            .catch(err => {
                console.error('Google Auth Validation Error:', err);
                alert(err.message || 'Login failed.');
                // Clear local storage if any
                localStorage.clear();
            });

    } catch (error) {
        console.error('Error processing Google Sign-In:', error);
        alert('Failed to sign in with Google. Please try again.');
    }
}

// Make the function globally available for Google's callback
window.handleGoogleSignIn = handleGoogleSignIn;

console.log('Google auth handler loaded');
