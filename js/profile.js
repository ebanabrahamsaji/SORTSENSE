// Profile Page Logic

let currentProfilePictureUrl = null;

document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();

    // Attach event listener to form
    const form = document.getElementById('profileForm');
    if (form) {
        form.addEventListener('submit', handleProfileUpdate);
    }

    // Attach event listener to file upload
    const fileInput = document.getElementById('avatarUpload');
    if (fileInput) {
        fileInput.addEventListener('change', handleAvatarUpload);
    }
});

function loadProfileData() {
    const userName = localStorage.getItem('userName') || 'User';
    const userEmail = localStorage.getItem('userEmail') || 'test@example.com';
    const userPicture = localStorage.getItem('userPicture');

    currentProfilePictureUrl = userPicture; // Initialize

    // Populate Fields
    const nameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const cityInput = document.getElementById('city');
    const stateInput = document.getElementById('state');
    const zipInput = document.getElementById('zip');
    const countryInput = document.getElementById('country');
    const headerName = document.getElementById('headerUserName');

    if (nameInput) nameInput.value = userName;
    if (emailInput) emailInput.value = userEmail;
    if (phoneInput) phoneInput.value = localStorage.getItem('userPhone') || '';
    if (cityInput) cityInput.value = localStorage.getItem('userCity') || '';
    if (stateInput) stateInput.value = localStorage.getItem('userState') || '';
    if (zipInput) zipInput.value = localStorage.getItem('userZip') || '';
    if (countryInput) countryInput.value = localStorage.getItem('userCountry') || '';
    if (headerName) headerName.textContent = userName;

    updateAvatarImages(userPicture, userName);
}

function updateAvatarImages(url, name) {
    const avatars = [
        document.getElementById('userAvatarSmall'),
        document.getElementById('profileAvatarLarge')
    ];

    avatars.forEach(img => {
        if (img) {
            if (url) {
                img.src = url;
            } else {
                const initials = name.split(' ').map(n => n[0]).join('');
                img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=10b981&color=fff`;
            }
        }
    });
}

async function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Optional: Validate file type/size here

    const formData = new FormData();
    formData.append('avatar', file);

    const btn = document.querySelector('.edit-avatar-btn');
    const originalContent = btn.innerHTML;
    // Show loading spinner
    btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i>';
    btn.disabled = true;

    try {
        const response = await fetch('/api/upload-avatar', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            currentProfilePictureUrl = data.url;
            // Update UI immediately
            updateAvatarImages(currentProfilePictureUrl, document.getElementById('fullName').value || 'User');

            // We save the URL in the variable 'currentProfilePictureUrl'
            // It will be sent to the backend when the user clicks "Save Changes"
        } else {
            throw new Error(data.message || 'Upload failed');
        }
    } catch (error) {
        console.error('Avatar Upload Error:', error);
        alert('Failed to upload avatar.');
    } finally {
        btn.innerHTML = '<i class="ri-camera-fill"></i>'; // Restore icon
        btn.disabled = false;
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const zip = document.getElementById('zip').value.trim();
    const country = document.getElementById('country').value.trim();

    const saveBtn = document.querySelector('.save-btn');

    if (!fullName) {
        alert("Name cannot be empty.");
        return;
    }

    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;

    try {
        const response = await fetch('/update-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                fullname: fullName,
                phone,
                city,
                state,
                zip,
                country,
                profilePicture: currentProfilePictureUrl // Send the new URL
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Update LocalStorage
            localStorage.setItem('userName', data.user.fullname);
            if (data.user.phone) localStorage.setItem('userPhone', data.user.phone);
            if (data.user.city) localStorage.setItem('userCity', data.user.city);
            if (data.user.state) localStorage.setItem('userState', data.user.state);
            if (data.user.zip) localStorage.setItem('userZip', data.user.zip);
            if (data.user.country) localStorage.setItem('userCountry', data.user.country);
            if (data.user.profilePicture) localStorage.setItem('userPicture', data.user.profilePicture);

            alert('Profile updated successfully!');
            loadProfileData(); // Refresh UI
        } else {
            throw new Error(data.message || 'Update failed');
        }

    } catch (error) {
        console.error('Update Error:', error);
        alert(`Failed to update profile: ${error.message}`);
    } finally {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    }
}
