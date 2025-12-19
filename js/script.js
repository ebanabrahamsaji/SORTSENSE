document.addEventListener('DOMContentLoaded', () => {
    // --- Scroll Reveal Animation ---
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- Mouse Parallax Effect for Hero (DISABLED) ---
    // const heroSection = document.querySelector('.hero');
    // const heroImage = document.querySelector('.hero-image img');
    // const floatingLeaves = document.querySelectorAll('.floating-leaf');

    // if (heroSection && heroImage) {
    //     heroSection.addEventListener('mousemove', (e) => {
    //         const x = (window.innerWidth - e.pageX * 2) / 90;
    //         const y = (window.innerHeight - e.pageY * 2) / 90;

    //         heroImage.style.transform = `translateX(${x}px) translateY(${y}px)`;

    //         floatingLeaves.forEach((leaf, index) => {
    //             const speed = (index + 1) * 2;
    //             leaf.style.transform = `translateX(${x * speed}px) translateY(${y * speed}px)`;
    //         });
    //     });

    //     // Reset on mouse leave
    //     heroSection.addEventListener('mouseleave', () => {
    //         heroImage.style.transform = 'translateX(0) translateY(0)';
    //         floatingLeaves.forEach(leaf => {
    //             leaf.style.transform = 'translateX(0) translateY(0)';
    //         });
    //     });
    // }

    // --- 3D Tilt Effect for Feature Cards ---
    const featureItems = document.querySelectorAll('.feature-item');

    featureItems.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10; // Max rotation deg
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });

    // User Login Form Handling
    const userLoginForm = document.getElementById('userLoginForm');
    if (userLoginForm) {
        userLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            console.log('User Login Attempt:', { email, password });

            // Store user data (in production, this would come from backend)
            const userName = email.split('@')[0];
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', userName.charAt(0).toUpperCase() + userName.slice(1));

            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        });
    }

    // Register Form Handling
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            console.log('User Registration:', { fullname, email });

            // Send to Backend
            fetch('http://localhost:8000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullname, email, password })
            })
                .then(res => res.json().then(data => ({ status: res.status, body: data })))
                .then(({ status, body }) => {
                    if (status === 201) {
                        console.log('✅ Registration successful');
                        // Store user data
                        localStorage.setItem('userEmail', email);
                        localStorage.setItem('userName', fullname);

                        // Redirect to dashboard
                        window.location.href = 'dashboard.html';
                    } else {
                        alert('Registration failed: ' + body.message);
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert('Error connecting to server. Is Node running?');
                });
        });
    }

    // Admin Login Form Handling
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const adminId = document.getElementById('adminId').value;
            const password = document.getElementById('password').value;

            console.log('Admin Login Attempt:', { adminId, password });
            alert('Admin login functionality would go here.\nAdmin ID: ' + adminId);
        });
    }
});
