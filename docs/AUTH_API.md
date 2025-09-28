# Authentication API Documentation

The Authentication API handles user registration, login, logout, password reset, email verification, and token refresh functionality. This API manages user authentication state and provides secure access to protected resources.

## Authentication

Most endpoints require authentication via cookies or tokens. The API uses HTTP-only cookies for token storage for enhanced security.

## Endpoints

### 1. Register User

```
POST /api/auth/register
```

Creates a new user account with email verification required before login.

**Request Body:**

```json
{
  "login": "john_doe",
  "password": "securePassword123",
  "passwordConfirmation": "securePassword123",
  "email": "john@example.com"
}
```

**Validation Rules:**

- `login`: 6-50 characters
- `password`: 6-100 characters
- `passwordConfirmation`: Must match password exactly
- `email`: Valid email format

**Response:**

```json
{
  "message": "User registered successfully!"
}
```

**Cookies Set:**

- `accessToken`: HTTP-only, 15 minutes expiration
- `refreshToken`: HTTP-only, persistent

### 2. Login User

```
POST /api/auth/login
```

Authenticates a user and provides access tokens. Only users with verified emails can login.

**Request Body:**

```json
{
  "login": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "message": "User logged in successfully!"
}
```

**Cookies Set:**

- `accessToken`: HTTP-only, 15 minutes expiration
- `refreshToken`: HTTP-only, persistent

### 3. Logout User

```
POST /api/auth/logout
```

Logs out the current user and invalidates their tokens.

**Response:**

```json
{
  "message": "User logged out successfully!"
}
```

**Cookies Cleared:**

- `accessToken`
- `refreshToken`

### 4. Request Password Reset

```
POST /api/auth/password-reset
```

Sends a password reset link to the user's email address.

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Response:**

```json
{
  "message": "Password reset link sent to email!"
}
```

### 5. Reset Password

```
POST /api/auth/password-reset/:confirm_token
```

Resets the user's password using a token from the email.

**Request Body:**

```json
{
  "password": "newSecurePassword123",
  "passwordConfirmation": "newSecurePassword123"
}
```

**Validation Rules:**

- `password`: 6-100 characters
- `passwordConfirmation`: Must match password exactly

**Response:**

```json
{
  "message": "Password reset successful!"
}
```

### 6. Verify Email

```
POST /api/auth/verify-email/:confirm_token
```

Verifies the user's email address using a token.

**Path Parameters:**

- `confirm_token`: 36-character verification token

**Response:**

```json
{
  "message": "Email verification successful!"
}
```

### 7. Refresh Token

```
POST /api/auth/token/refresh
```

Refreshes the access token using a valid refresh token.

**Cookies Required:**

- `refreshToken`: Valid refresh token

**Response:**

```json
{
  "message": "Tokens refreshed successfully!"
}
```

**Cookies Set:**

- `accessToken`: New access token, 15 minutes expiration
- `refreshToken`: New refresh token, persistent

## Error Responses

### 400 Bad Request

```json
{
  "errors": [
    {
      "property": "login",
      "constraints": {
        "minLength": "login must be longer than or equal to 6 characters"
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

#### User Banned Error

When a user account is banned, the API returns a specialized `UserBannedError` with detailed ban information.

**Temporary Ban:**
```json
{
  "name": "UserBannedError",
  "message": "Your account is temporarily banned until 12/31/2024, 11:59:59 PM. Please try again after this time.",
  "statusCode": 403,
  "isPermanent": false,
  "expiresAt": "2024-12-31T23:59:59.000Z",
  "bannedAt": "2024-01-15T10:30:00.000Z"
}
```

**Permanent Ban:**
```json
{
  "name": "UserBannedError",
  "message": "Your account has been permanently banned. Please contact support for assistance.",
  "statusCode": 403,
  "isPermanent": true,
  "expiresAt": null,
  "bannedAt": "2024-01-15T10:30:00.000Z"
}
```


### 404 Not Found

```json
{
  "message": "User not found"
}
```

### 409 Conflict

```json
{
  "error": "User with this login already exists"
}
```

## Database Schema

The authentication system utilizes several tables:

### `user` table

- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `login` (VARCHAR(50), UNIQUE, NOT NULL)
- `password_hash` (VARCHAR(255), NOT NULL)
- `password_salt` (VARCHAR(255), NOT NULL)
- `email` (VARCHAR(100), UNIQUE, NOT NULL)
- `email_verified` (BOOLEAN, DEFAULT FALSE)
- `role` (ENUM: 'user', 'admin', 'donator', 'moderator')
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

### `email_verifications` table

- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `user_id` (INT, FOREIGN KEY to user.id)
- `confirm_token` (VARCHAR(36), UNIQUE, NOT NULL)
- `expires_at` (DATETIME, NOT NULL)
- `created_at` (DATETIME)

### `password_resets` table

- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `user_id` (INT, FOREIGN KEY to user.id)
- `reset_token` (VARCHAR(255), UNIQUE, NOT NULL)
- `expires_at` (DATETIME, NOT NULL)
- `created_at` (DATETIME)

### `refresh_tokens` table

- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `user_id` (INT, FOREIGN KEY to user.id)
- `token` (VARCHAR(255), UNIQUE, NOT NULL)
- `expires_at` (DATETIME, NOT NULL)
- `ip_address` (VARCHAR(45))
- `user_agent` (TEXT)
- `created_at` (DATETIME)

## Security Features

- HTTP-only cookies prevent XSS attacks
- Secure flag in production for HTTPS
- SameSite=strict prevents CSRF attacks
- Password hashing with salt
- Token expiration management
- Email verification requirement
- Rate limiting on sensitive endpoints

## Usage Examples

### Complete registration flow

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"login": "testuser", "password": "password123", "passwordConfirmation": "password123", "email": "test@example.com"}'

# Verify email (using token from email)
curl -X POST http://localhost:3000/api/auth/verify-email/your-verification-token

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login": "testuser", "email": "test@example.com", "password": "password123"}'
```

### Password reset flow

```bash
# Request password reset
curl -X POST http://localhost:3000/api/auth/password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Reset password (using token from email)
curl -X POST http://localhost:3000/api/auth/password-reset/your-reset-token \
  -H "Content-Type: application/json" \
  -d '{"password": "newpassword123", "passwordConfirmation": "newpassword123"}'
```
