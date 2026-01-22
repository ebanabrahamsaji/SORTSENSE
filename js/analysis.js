console.log("LIVE MAP v2.1 LOADED");

// --- GLOBAL MAP STATE ---
window.userLat = null;
window.userLng = null;
let map = null;
let markersLayer = null;

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const preview = document.getElementById('preview');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultsArea = document.getElementById('resultsArea');
    let uploadedFile = null;

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
        uploadedFile = file;
    }

    // 2. Analyze Action
    analyzeBtn.addEventListener('click', async (e) => {
        e.stopPropagation(); // Prevent re-triggering dropzone

        if (!uploadedFile) return;

        // Reset UI
        clearError();
        resultsArea.style.display = 'none';

        // UI Loading State
        analyzeBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Analyzing...';
        analyzeBtn.disabled = true;

        const formData = new FormData();
        formData.append('image', uploadedFile);

        // Add User ID for History
        const userId = localStorage.getItem('app_user_id') || localStorage.getItem('userId');
        if (userId) {
            formData.append('userId', userId);
        }

        try {
            // Call AI API
            const response = await fetch('/api/waste/identify', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                // UNIFIED UI: Store result & Image, then redirect to the main result page
                // This ensures Image Analysis looks EXACTLY like Quick Search output.

                try {
                    // Safe cleanup
                    sessionStorage.removeItem('wasteImage');
                    sessionStorage.removeItem('analysisResult');

                    // 1. Store the Analysis Data
                    sessionStorage.setItem('analysisResult', JSON.stringify(result));

                    // 2. Store the Image (from preview src which is already Base64)
                    const previewImg = document.getElementById('preview');
                    if (previewImg && previewImg.src) {
                        sessionStorage.setItem('wasteImage', previewImg.src);
                    }

                    // 3. Redirect to the unified Output Screen
                    window.location.href = 'analysis-result.html';

                } catch (e) {
                    console.error("Storage/Redirect Error:", e);
                    showError("Failed to load results page.");
                }

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

        dropZone.appendChild(errorDiv);

        setTimeout(() => {
            if (errorDiv) errorDiv.remove();
        }, 5000);
    }

    function clearError() {
        const existingError = document.getElementById('error-notification');
        if (existingError) existingError.remove();
    }

    // 3. Display Results
    function displayResults(data) {
        resultsArea.style.display = 'grid'; // Show Kind of Grid
        resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Update Text
        const badge = document.getElementById('categoryBadge');
        const category = data.category || 'Unknown';
        badge.textContent = (typeof getTranslation === 'function') ? getTranslation(category) : category;

        // Dynamic Badge Color
        if (category === 'Uncertain') {
            badge.style.background = '#64748b'; // Gray
        } else if (data.is_hazardous) {
            badge.style.background = '#ef4444'; // Red for Hazardous
        } else {
            const lowerCat = category.toLowerCase();
            if (lowerCat.includes('wet')) badge.style.background = '#22c55e'; // Green
            else if (lowerCat.includes('dry')) badge.style.background = '#3b82f6'; // Blue
            else badge.style.background = 'var(--primary-color)';
        }

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

        const catLower = category.toLowerCase();
        let disposalHtml = "";
        let ruleHtml = "";

        // Heuristic disposal logic
        let baseKey = catLower;
        if (catLower.includes('plastic')) baseKey = 'plastic';
        else if (catLower.includes('glass')) baseKey = 'glass';
        else if (catLower.includes('metal')) baseKey = 'metal';
        else if (catLower.includes('organic') || catLower.includes('wet')) baseKey = 'organic';
        else if (catLower.includes('ewaste') || catLower.includes('e-waste')) baseKey = 'ewaste';
        else if (catLower.includes('paper')) baseKey = 'paper';
        else if (catLower.includes('textile')) baseKey = 'textile';
        else if (catLower.includes('hazard')) baseKey = 'hazardous';

        const tDisposal = (typeof getTranslation === 'function') ? getTranslation(baseKey + '_disposal') : null;
        const tRule = (typeof getTranslation === 'function') ? getTranslation(baseKey + '_rule') : null;

        if (tDisposal && tDisposal !== (baseKey + '_disposal')) {
            disposalHtml = tDisposal;
            ruleHtml = tRule;
        } else {
            if (data.details) {
                disposalHtml = data.details.disposal_guideline;
                ruleHtml = data.details.kerala_mandate || data.details.safety_instructions;
            } else {
                disposalHtml = "No specific data found.";
                ruleHtml = "Consult local authorities.";
            }
        }

        document.getElementById('disposalText').innerHTML = disposalHtml;
        document.getElementById('keralaRule').innerHTML = ruleHtml;

        // Initialize Map
        if (data.status !== 'Uncertain') {
            // Determine filter category for the map
            let mapCategory = 'all';
            if (baseKey === 'ewaste') mapCategory = 'E-waste';
            else if (baseKey === 'hazardous' || baseKey === 'medical') mapCategory = 'Hazardous'; // Adjust as needed
            else if (baseKey && baseKey !== 'unknown') mapCategory = baseKey.charAt(0).toUpperCase() + baseKey.slice(1);

            setTimeout(() => {
                startSmartMapSystem(mapCategory);
            }, 500);
        }
    }
});

// --- STABLE MAP ENGINE FUNCTIONS ---

function startSmartMapSystem(category) {
    if (map) { map.remove(); map = null; }

    // Default view (Kerala center-ish)
    map = L.map('map').setView([9.9312, 76.2673], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);

    // Get User Location ONCE (No live tracking)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                window.userLat = position.coords.latitude;
                window.userLng = position.coords.longitude;
                // Center map on user
                map.setView([window.userLat, window.userLng], 12);
                loadAndRenderCenters(category);
            },
            (err) => {
                console.warn("Location denied or error:", err);
                loadAndRenderCenters(category); // Load anyway, just no distances
            }
        );
    } else {
        loadAndRenderCenters(category);
    }
}

function loadAndRenderCenters(category) {
    // API Call with Category Filter
    let url = `/api/centers`;
    if (category && category !== 'all') {
        url += `?category=${encodeURIComponent(category)}`;
    }

    fetch(url)
        .then(res => res.json())
        .then(centers => {
            if (!Array.isArray(centers) || centers.length === 0) {
                console.log("No centers found for category:", category);
                return;
            }

            if (window.userLat && window.userLng) {
                centers.forEach(c => {
                    c._distance = getDistanceFromLatLonInKm(window.userLat, window.userLng, c.latitude, c.longitude);
                });
                // Sort by distance
                centers.sort((a, b) => a._distance - b._distance);
            }

            // 2. Render Markers
            renderMarkers(centers);
        })
        .catch(e => console.error("Map Error:", e));
}

function renderMarkers(centers) {
    markersLayer.clearLayers();
    const bounds = L.latLngBounds([]);

    centers.forEach((center, index) => {
        const isNearest = (index === 0 && window.userLat != null);
        const distText = center._distance ? `${parseFloat(center._distance).toFixed(2)} km away` : 'Distance unknown';

        // Green Marker Icon similar to screenshot
        const greenIconHtml = `<div class="marker-pin-green"><i class="ri-map-pin-fill"></i></div>`;
        const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: greenIconHtml,
            iconSize: [30, 42],
            iconAnchor: [15, 42],
            popupAnchor: [0, -38]
        });

        // Popup Content exactly matching screenshot request
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}`;

        let popupHtml = `
            <div class="popup-stable">
                <div class="popup-header">
                    <strong style="font-size: 1.1em; color: #0f172a;">${center.center_name}</strong>
                    <!-- Close button is default in Leaflet, we don't need a custom one unless we override -->
                </div>
                <div class="popup-tags" style="margin-top: 5px;">
                    <span style="background: #f1f5f9; color: #64748b; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-weight: 600;">${center.type || 'hks'}</span>
                    <span style="color: #64748b; font-size: 0.9em;"> ${center.address || ''}</span>
                </div>
                <div class="popup-distance" style="color: #22c55e; font-weight: 600; margin: 8px 0; display: flex; align-items: center; gap: 5px;">
                    <i class="ri-map-pin-line"></i> ${distText}
                </div>
                
                <a href="${googleMapsUrl}" target="_blank" style="display: block; width: 100%; background: #3b82f6; color: white; text-align: center; padding: 8px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-bottom: 8px;">
                    <i class="ri-navigation-fill"></i> Navigate
                </a>
        `;

        if (isNearest) {
            popupHtml += `
                <div style="background: #dcfce7; color: #166534; text-align: center; padding: 5px; border-radius: 6px; font-weight: 700; font-size: 0.85em;">
                    ⭐ NEAREST
                </div>
            `;
        }

        popupHtml += `</div>`;

        const marker = L.marker([center.latitude, center.longitude], { icon: customIcon })
            .bindPopup(popupHtml, {
                maxWidth: 260
            })
            .addTo(markersLayer);

        if (isNearest) {
            marker.openPopup();
        }

        bounds.extend([center.latitude, center.longitude]);
    });

    if (centers.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}

// Distance Calc
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) { return deg * (Math.PI / 180); }
