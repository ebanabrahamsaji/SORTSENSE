document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const preview = document.getElementById('preview');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultsArea = document.getElementById('resultsArea');

    // User Location State
    let userLat = null;
    let userLng = null;
    let map = null;
    let markers = [];
    let uploadedFile = null; // Fix 1: Dedicated variable

    // 1. Handle File Upload UI
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--primary-color)';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#e2e8f0';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#e2e8f0';
        handleFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', (e) => {
        handleFile(e.target.files[0]);
    });

    function handleFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            alert('Please upload a valid image file.');
            return;
        }

        // Show Preview
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
            analyzeBtn.style.display = 'inline-block';
        };
        reader.readAsDataURL(file);

        // Store file for upload
        uploadedFile = file; // Fix 1: Use variable
    }

    // 2. Get Location (Pre-load)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                userLat = pos.coords.latitude;
                userLng = pos.coords.longitude;
                console.log("Location acquired:", userLat, userLng);
            },
            (err) => {
                console.warn("Location permission denied or unavailable", err);
                // Default to Kochi if denied
                userLat = 9.9312;
                userLng = 76.2673;
            }
        );
    }

    // 3. Analyze Action
    // 3. Analyze Action
    analyzeBtn.addEventListener('click', async (e) => {
        e.stopPropagation(); // Prevent re-triggering dropzone

        if (!uploadedFile) return;

        // Reset UI
        clearError();
        resultsArea.style.display = 'none';

        // UI Loading State
        const originalBtnText = analyzeBtn.innerHTML;
        analyzeBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Analyzing...';
        analyzeBtn.disabled = true;

        const formData = new FormData();
        formData.append('image', uploadedFile);

        try {
            // Call AI API
            const response = await fetch('/api/waste/identify', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                displayResults(result);
            } else {
                showError(result.message || 'Analysis failed. Please try again.');
            }

        } catch (error) {
            console.error('Error:', error);
            showError('Connection error. Please check your internet or server status.');
        } finally {
            analyzeBtn.innerHTML = '<i class="ri-magic-line"></i> Identify Waste';
            analyzeBtn.disabled = false;
        }
    });

    // Helper: Show Error
    function showError(msg) {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'error-notification';
        errorDiv.style.background = 'rgba(239, 68, 68, 0.15)'; // Red with opacity
        errorDiv.style.border = '1px solid #ef4444';
        errorDiv.style.color = '#ef4444';
        errorDiv.style.padding = '1rem';
        errorDiv.style.borderRadius = '12px';
        errorDiv.style.marginTop = '1.5rem';
        errorDiv.style.textAlign = 'center';
        errorDiv.style.display = 'flex';
        errorDiv.style.alignItems = 'center';
        errorDiv.style.justifyContent = 'center';
        errorDiv.style.gap = '0.5rem';
        errorDiv.innerHTML = `<i class="ri-error-warning-line"></i> <span>${msg}</span>`;

        // Insert after button
        const uploadSection = document.querySelector('.upload-section');
        uploadSection.appendChild(errorDiv);

        // Auto dismiss after 5s or just leave it
        setTimeout(() => {
            if (errorDiv) errorDiv.remove();
        }, 5000);
    }

    function clearError() {
        const existingError = document.getElementById('error-notification');
        if (existingError) existingError.remove();
    }

    // 4. Display Results
    function displayResults(data) {
        resultsArea.style.display = 'grid'; // Show Grid

        // Scroll to results
        resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Update Text
        const badge = document.getElementById('categoryBadge');
        const category = data.category || 'Unknown';
        badge.textContent = category;

        // Dynamic Badge Color
        if (category === 'Uncertain') {
            badge.style.background = '#64748b'; // Gray
        } else if (data.is_hazardous) {
            badge.style.background = '#ef4444'; // Red for Hazardous
        } else {
            // Default Green/Primary for Dry/Wet
            const lowerCat = category.toLowerCase();
            if (lowerCat.includes('wet')) badge.style.background = '#22c55e'; // Green
            else if (lowerCat.includes('dry')) badge.style.background = '#3b82f6'; // Blue
            else badge.style.background = 'var(--primary-color)';
        }

        // Fix 2: Clamp Confidence
        // Use legacy numeric confidence for the bar
        const safeConfidence = Math.min(100, data.confidence || 0);
        document.getElementById('confidenceText').textContent = safeConfidence + '%';
        document.getElementById('confidenceBar').style.width = safeConfidence + '%';

        // Show detailed message
        const msgEl = document.getElementById('analysisMessage');
        if (msgEl) {
            if (data.ai_analysis) {
                const { object_name, material, hazardous } = data.ai_analysis;
                const hazardWarn = hazardous ? " ⚠️ HAZARDOUS" : "";
                msgEl.innerHTML = `<strong>Object:</strong> ${object_name}<br>
                                    <strong>Material:</strong> ${material}${hazardWarn}`;
            } else {
                msgEl.textContent = data.message || 'Analysis complete.';
            }
        }

        if (data.details) {
            document.getElementById('disposalText').textContent = data.details.disposal_guideline;
            document.getElementById('keralaRule').textContent = data.details.kerala_mandate || data.details.safety_instructions;
        } else {
            document.getElementById('disposalText').textContent = "No specific data found.";
            document.getElementById('keralaRule').textContent = "Consult local authorities.";
        }

        // Initialize Map
        if (data.status !== 'Uncertain') {
            setTimeout(() => {
                initMap(data.category);
            }, 500); // Small delay to allow layout (grid) to settle
        }
    }

    // 5. Initialize Leaflet Map
    async function initMap(category) {
        // Clear previous map if exists
        // Wait... standard pattern is to reuse map or remove it. 
        // User asked to clear markers.

        if (!map) {
            const centerLat = userLat || 9.9312;
            const centerLng = userLng || 76.2673;
            map = L.map('map').setView([centerLat, centerLng], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            if (userLat) {
                L.marker([userLat, userLng])
                    .addTo(map)
                    .bindPopup("<b>You are here</b>")
                    .openPopup();
            }
        }

        // Fix 3: Clear Markers
        markers.forEach(m => map.removeLayer(m));
        markers = [];


        // Center on user or Default Kochi
        const centerLat = userLat || 9.9312;
        const centerLng = userLng || 76.2673;

        // Fetch Centers Filtered by Category & Location
        try {
            // Fix 4: Pass category in query
            const query = new URLSearchParams({
                lat: centerLat,
                lng: centerLng,
                category: category || ''
            });

            const res = await fetch(`/api/centers?${query.toString()}`);
            const centers = await res.json();

            // Add Markers (Red)
            const redIcon = new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            centers.forEach(center => {
                const m = L.marker([center.latitude, center.longitude], { icon: redIcon })
                    .addTo(map)
                    .bindPopup(`
                        <b>${center.center_name}</b><br>
                        ${center.address}<br>
                        <i>Distance: ${center.distance} km</i>
                    `);
                markers.push(m); // Fix 3: tracking
            });

        } catch (err) {
            console.error("Map data error:", err);
        }
    }
});
