# Add Center User Feature

## Overview
This feature allows administrators to create new user accounts with the "CENTER" role that are linked to existing collection centers. This enables multiple users to manage the same collection center.

## API Endpoint

### POST `/api/centers/add-user`

Creates a new center user account linked to an existing collection center.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@center.com",
  "password": "securePassword123",
  "centerId": 1
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Center user created successfully",
  "userId": 42,
  "centerName": "Kochi Corporation Bio-Plant"
}
```

**Response (Error - 400):**
```json
{
  "message": "Name, Email, Password, and Center ID are required."
}
```

**Response (Error - 404):**
```json
{
  "message": "Collection center not found."
}
```

**Response (Error - 409):**
```json
{
  "message": "User with this email already exists."
}
```

## Features

1. **Validation:**
   - Checks all required fields (name, email, password, centerId)
   - Validates email format
   - Verifies collection center exists
   - Checks for duplicate email addresses

2. **Security:**
   - Passwords are hashed using bcrypt (10 rounds)
   - Email validation prevents invalid addresses

3. **User Creation:**
   - Role is automatically set to 'CENTER'
   - Status is set to 'Active'
   - User is linked to the specified center via `center_id`

4. **Email Notification:**
   - Welcome email sent to new user
   - Includes login credentials and assigned center name
   - Contains direct link to login page

## Database Schema

The feature assumes the `tbl_users` table has a `center_id` column:

```sql
ALTER TABLE tbl_users ADD COLUMN center_id INT NULL;
ALTER TABLE tbl_users ADD FOREIGN KEY (center_id) REFERENCES tbl_collection_centers(center_id);
```

## Usage Example

### Using cURL:

```bash
curl -X POST http://localhost:8000/api/centers/add-user \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Center Manager",
    "email": "manager@kochicenter.com",
    "password": "SecurePass123!",
    "centerId": 1
  }'
```

### Using JavaScript (Fetch):

```javascript
async function addCenterUser() {
    const response = await fetch('/api/centers/add-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: 'Center Manager',
            email: 'manager@kochicenter.com',
            password: 'SecurePass123!',
            centerId: 1
        })
    });
    
    const data = await response.json();
    console.log(data);
}
```

## Files Modified

1. **`controllers/centerController.js`**
   - Added `addCenterUser` function
   - Added imports for `bcrypt` and `transporter`

2. **`routes/centerRoutes.js`**
   - Added route: `POST /add-user`
   - Imported `addCenterUser` controller

## Testing

1. **Get list of centers:**
   ```bash
   curl http://localhost:8000/api/centers
   ```

2. **Create a center user for center ID 1:**
   ```bash
   curl -X POST http://localhost:8000/api/centers/add-user \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Manager","email":"test@center.com","password":"test123","centerId":1}'
   ```

3. **Verify user was created:**
   - Check database: `SELECT * FROM tbl_users WHERE email='test@center.com'`
   - Try logging in with the credentials
   - Check email inbox for welcome message

## Integration Points

This feature integrates with:
- **Authentication System:** New users can log in with their credentials
- **Email System:** Welcome emails sent via configured SMTP
- **Center Dashboard:** Users with CENTER role can access center management features
- **Database:** Links users to specific collection centers

## Future Enhancements

1. Add UI in admin dashboard to create center users
2. Allow center managers to add additional users to their own center
3. Add user management page for centers
4. Implement role-based permissions for center users
5. Add audit logging for user creation events
