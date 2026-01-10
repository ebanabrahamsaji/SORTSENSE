# SortSense AI Waste Detection Implementation Plan

## 1. Architecture Overview
This plan details the implementation of an AI-powered waste detection system specifically tailored for Kerala's disposal guidelines.

**Flow:**
1.  **Frontend**: User captures/uploads image + Geolocation (Lat/Lng).
2.  **Backend (Node.js)**: Receives image via Multer.
3.  **Bridge**: Node.js spawns a Python child process to run YOLO.
4.  **AI Service (Python)**: Loads YOLO model, predicts category (Plastic, Glass, etc.), returns JSON.
5.  **Data Enhancement**: Backend uses the predicted Category ID to fetch **Kerala-specific rules** and **Nearest Collection Centers** from MySQL.
6.  **Response**: Frontend receives a complete JSON packet with category, confidence, safety tips, and map data.

---

## 2. Folder Structure
The existing structure is good. We will make specific targeted updates.

```
SORTSENSE/
├── ml/
│   ├── classify.py           # [UPDATE] Real YOLO implementation
│   ├── yolov8n.pt           # [NEW] Pre-trained YOLO weights
│   └── requirements.txt      # [NEW] Python dependencies
├── controllers/
│   ├── wasteController.js    # [UPDATE] Logic to merge AI result with DB data
│   └── centerController.js   # [UPDATE] Add Haversine distance sorting
├── routes/
│   └── wasteRoutes.js        # [EXISTING] Handles image upload
├── js/
│   └── analysis.js           # [NEW] Frontend logic for upload & map
├── pages/
│   └── identify.html         # [NEW] UI for AI detection feature
└── ...
```

---

## 3. Implementation Steps

### Phase 1: Python AI Service (`ml/`)
**Goal**: Convert mock script to real YOLO detection.

1.  **Dependencies**: Create `ml/requirements.txt`:
    ```
    ultralytics
    opencv-python-headless
    numpy
    ```
2.  **Model**: Download `yolov8n-cls.pt` (Classification) or `yolov8n.pt` (Detection).
    *   *Recommendation*: Use **Classification** model (`yolov8n-cls.pt`) trained on waste classes if available, otherwise map generic COCO classes (e.g., 'bottle' -> 'plastic') using the Standard Detection model.
3.  **Script (`ml/classify.py`)**:
    *   Load Model.
    *   Predict class.
    *   Map predicted class to SortSense Categories (Plastic, Glass, Metal, Paper, Organic, E-waste, Battery).
    *   Return JSON: `{ "category": "Plastic", "confidence": 0.92 }`.

### Phase 2: Database Population (SQL)
**Goal**: Ensure database has Kerala-specific content.

1.  **Categories**: Ensure `tbl_categories` has: 'Plastic', 'Glass', 'Metal', 'Paper', 'Organic', 'E-waste', 'Battery'.
2.  **Collection Centers**: Populate `tbl_collection_centers` with dummy or real Kerala centers (Lat/Lng is crucial).
3.  **Waste Data**: Update `tbl_waste_items` or generic category fields to include:
    *   `disposal_guideline` (e.g., "Wash and dry. Hand over to Haritha Karma Sena.")
    *   `safety_instructions` (e.g., "Wrap broken glass in newspaper.")

### Phase 3: Backend Logic (`controllers/`)
**Goal**: Intelligent Data Aggregation.

1.  **`wasteController.js`**:
    *   Call Python script.
    *   Parse JSON result.
    *   Refuse results with Low Confidence (< 50%) -> Return "Manual Check Needed".
    *   **Crucial Step**: Use the refined `category` to Query `tbl_categories` and `tbl_waste_items` to get the *text descriptions*.
    *   Return combined object.

2.  **`centerController.js`**:
    *   Update `getCollectionCenters` to accept `lat` and `lng`.
    *   Implement **Haversine Formula** in SQL or JS to calculate distance.
    *   sort by distance ASC.
    *   Limit to nearest 5.

### Phase 4: Frontend UI (`pages/` & `js/`)
**Goal**: User Experience.

1.  **`pages/identify.html`**:
    *   Camera/File Input.
    *   Preview Image area.
    *   "Analyze" Button.
    *   **Results Section**:
        *   Category Name & Confidence Bar.
        *   "What do I do?" (Kerala Rules).
        *   Map Container (`#map`).
2.  **`js/analysis.js`**:
    *   Handle File Select using FileReader API (preview).
    *   `navigator.geolocation.getCurrentPosition` to get user coords.
    *   POST to `/api/waste/identify`.
    *   Render Response HTML.
    *   Initialize Google Maps / Leaflet with markers for User and Centers.

---

## 4. API Data Flow

**Request:** `POST /api/waste/identify`
*   Body: `FormData` (Image file)

**Response (Success):**
```json
{
  "category": "Plastic",
  "confidence": 92.5,
  "details": {
    "description": "Rigid Plastic (PET)",
    "disposal_rule": "Rinse, remove label, compress.",
    "kerala_mandate": "Hand over to Haritha Karma Sena during monthly collection."
  },
  "nearby_centers": [
    {
      "name": "Kochi Corp Center A",
      "lat": 9.9312,
      "lng": 76.2673,
      "distance_km": 1.2
    }
  ]
}
```

---

## 5. Best Practices & Constraints Check
*   **Performance**: Python script load time can be slow. *Mitigation*: Keep model loaded in memory if possible (requires persistent python service) OR accept 1-2s latency for `spawn` (simpler for this stack).
*   **Scalability**: The modular controller/route design allows swapping the Python script for a cloud API later if needed.
*   **Error Handling**:
    *   **No GPS**: Fallback to showing all centers in city OR ask user to type City.
    *   **Server Error**: Show "AI Service Busy, try manual search".
    *   **Ambiguous Image**: Show "Could not identify. Please select manually."

## 6. Next Immediate Action
Run the implementation workflow.
