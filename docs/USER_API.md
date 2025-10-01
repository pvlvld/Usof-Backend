# User API Documentation

The User API manages user profiles, avatars, and administrative functions. It provides endpoints for user management, profile updates, and administrative actions like banning users.

## Authentication

Most endpoints require authentication. Some administrative functions require admin privileges.

## Endpoints

### 1. Get All Users

```
GET /api/users
```

Returns a paginated list of all users with filtering and sorting options.

**Query Parameters:**

- `page` (optional): Page number (default: 1, minimum: 1)
- `limit` (optional): Items per page (default: 10, range: 1-100)
- `sort` (optional): Sort field - "id", "login", "rating", "created_at", "updated_at" (default: "id")
- `order` (optional): Sort order - "ASC" or "DESC" (default: "ASC")

**Response:**

```json
[
  {
    "id": 1,
    "login": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "rating": 150,
    "avatar": "avatar.jpg",
    "email_verified": true,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "banned_until": null,
    "ban_reason": null,
    "deleted_at": null
  }
]
```

### 2. Get User by ID

```
GET /api/users/:user_id
```

Returns detailed information about a specific user.

**Path Parameters:**

- `user_id`: User ID (integer, minimum: 1)

**Response:**

```json
{
  "id": 1,
  "login": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "rating": 150,
  "avatar": "avatar.jpg",
  "email_verified": true,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z",
  "banned_until": null,
  "ban_reason": null,
  "deleted_at": null
}
```

### 3. Create User (Admin Only)

```
POST /api/users
```

Creates a new user account. Requires admin authentication.

**Authentication:** Admin required

**Request Body:**

```json
{
  "login": "newuser",
  "password": "securePassword123",
  "email": "newuser@example.com",
  "role": "user"
}
```

**Validation Rules:**

- `login`: 2-100 characters
- `password`: 6-100 characters
- `email`: Valid email format
- `role`: "user", "admin", or "donator"

**Response:**

```json
{
  "id": 2,
  "login": "newuser",
  "email": "newuser@example.com",
  "role": "user",
  "rating": 0,
  "avatar": null,
  "email_verified": false,
  "created_at": "2024-01-15T11:00:00.000Z",
  "updated_at": "2024-01-15T11:00:00.000Z",
  "banned_until": null,
  "ban_reason": null,
  "deleted_at": null
}
```

### 4. Update User Profile

```
PATCH /api/users/:user_id
```

Updates user information. Users can only update their own profiles unless they are admins.

**Authentication:** Required (own profile or admin)

**Path Parameters:**

- `user_id`: User ID (integer, minimum: 1)

**Request Body (all fields optional):**

```json
{
  "login": "updated_login",
  "email": "updated@example.com",
  "password": "newPassword123",
  "role": "donator",
  "avatar": "new_avatar.jpg",
  "rating": 200,
  "fullName": "John Doe",
  "banned_until": "2024-12-31T23:59:59.000Z",
  "ban_reason": "Violation of terms",
  "deleted_at": null
}
```

**Validation Rules:**

- `login`: 2-100 characters
- `email`: Valid email format
- `password`: 6-100 characters (if provided)
- `role`: "user", "admin", or "donator"
- `avatar`: Max 100 characters
- `rating`: Integer
- `fullName`: Max 100 characters
- `ban_reason`: Max 255 characters

**Response:**

```json
{
  "message": "User updated successfully"
}
```

### 5. Upload User Avatar

```
PATCH /api/users/avatar
```

Uploads and processes a user avatar image.

**Authentication:** Required

**Request Body:**

- `avatar`: Image file (multipart/form-data)

**Response:**

```json
{
  "message": "Avatar uploaded successfully",
  "file": {
    "fieldname": "avatar",
    "originalname": "profile.jpg",
    "filename": "avatar_*user_id*.webp",
    "path": "/uploads/avatars/avatar_*user_id*.webp",
    "size": 45678
  }
}
```

### 6. Get User Avatar

```
GET /api/users/:user_id/avatar
```

Serves the user's avatar image or a default avatar if none exists.

**Path Parameters:**

- `user_id`: User ID (integer, minimum: 1)

**Response:**

- Success: Image file (200)
- Not found: JSON error (404)

### 7. Ban User (Admin Only)

```
POST /api/users/:user_id/ban
```

Bans a user for a specified duration or permanently.

**Authentication:** Admin required

**Path Parameters:**

- `user_id`: User ID (integer, minimum: 1)

**Request Body:**

```json
{
  "banned_until": "2024-12-31T23:59:59.000Z",
  "ban_reason": "Violation of community guidelines"
}
```

**Request Body (Permanent Ban):**

```json
{
  "banned_until": "",
  "ban_reason": "Severe violation"
}
```

**Response:**

```json
{
  "message": "User banned successfully",
  "until": "2024-12-31T23:59:59.000Z"
}
```

### 8. Unban User (Admin Only)

```
POST /api/users/:user_id/unban
```

Removes a ban from a user.

**Authentication:** Admin required

**Path Parameters:**

- `user_id`: User ID (integer, minimum: 1)

**Response:**

- Success: 204 No Content
- Not found: JSON error (404)

### 9. Delete User

```
DELETE /api/users/:user_id
```

Soft deletes a user account.

**Authentication:** Required (own profile or admin)

**Path Parameters:**

- `user_id`: User ID (integer, minimum: 1)

**Response:**

```json
{
  "message": "User deleted successfully"
}
```

## Error Responses

### 400 Bad Request

```json
{
  "errors": [
    {
      "property": "login",
      "constraints": {
        "minLength": "login must be longer than or equal to 2 characters"
      }
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "error": "Invalid or expired access token"
}
```

### 403 Forbidden

```json
{
  "error": "You can only update your own profile"
}
```

### 404 Not Found

```json
{
  "message": "User not found"
}
```

### 404 Avatar Not Found

```json
{
  "message": "Avatar not found"
}
```

## Database Schema

The user system utilizes the following table:

### `user` table

- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `login` (VARCHAR(50), UNIQUE, NOT NULL)
- `password_hash` (VARCHAR(255), NOT NULL)
- `password_salt` (VARCHAR(255), NOT NULL)
- `full_name` (VARCHAR(100), NULLABLE)
- `email` (VARCHAR(100), UNIQUE, NOT NULL)
- `email_verified` (BOOLEAN, DEFAULT FALSE)
- `avatar` (VARCHAR(255), NULLABLE)
- `rating` (INT, DEFAULT 0)
- `role` (ENUM: 'user', 'admin', 'donator', 'moderator', DEFAULT 'user')
- `created_at` (DATETIME)
- `updated_at` (DATETIME)
- `banned_until` (DATETIME, NULLABLE)
- `ban_reason` (VARCHAR(255), NULLABLE)
- `deleted_at` (DATETIME, NULLABLE) - Soft delete

## User Roles

- **user**: Standard user with basic permissions
- **admin**: Full administrative access
- **donator**: Premium user with additional features
- **moderator**: Limited administrative access

## Avatar Processing

The avatar upload system includes:

- Image resizing and compression
- Automatic conversion to WebP format
- Support for animated avatars for donators
- Default avatar fallback for users without avatars

## Usage Examples

### Get users with pagination

```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=20&sort=rating&order=DESC"
```

### Update user profile

```bash
curl -X PATCH http://localhost:3000/api/users/123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"login": "newusername", "email": "newemail@example.com"}'
```

### Upload avatar

```bash
curl -X PATCH http://localhost:3000/api/users/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@/path/to/image.jpg"
```

### Ban user (Admin only)

```bash
curl -X POST http://localhost:3000/api/users/123/ban \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"banned_until": "2024-12-31T23:59:59.000Z", "ban_reason": "Spam"}'
```
