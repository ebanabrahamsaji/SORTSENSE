async function testAuth() {
    // 1. Get token
    const resAuth = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'ekm@sortsense.com', password: 'password123' })
    });
    const authData = await resAuth.json();
    console.log("Auth:", authData);

    // 2. Try to get center token from api/centers/login as fallback
    let token = authData.token;
    if (!token) {
        const resCenterAuth = await fetch('http://localhost:8000/api/centers/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'ekm@sortsense.com', password: 'password123' })
        });
        const centerAuthData = await resCenterAuth.json();
        console.log("Center Auth:", centerAuthData);
        token = centerAuthData.token;
    }

    if (!token) {
        console.log("Failed to login");
        process.exit();
    }

    console.log("Using token:", token);

    // 3. Make GET (just to check if we can even get it)
    const resGet = await fetch('http://localhost:8000/api/messages/user-center/history/61', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const getData = await resGet.json();
    console.log("Get:", getData);

    // 4. Make POST
    const resPost = await fetch('http://localhost:8000/api/messages/user-center/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
            requestId: 61,
            message: "This is a test message from center over HTTP"
        })
    });

    const postData = await resPost.json();
    console.log("Send:", postData);
}

testAuth();
