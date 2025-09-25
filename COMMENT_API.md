# Comment API Documentation

The Comment API manages comments on posts, including nested comments (replies). Users can create, update, delete, and like/dislike comments. Comments support threading with parent-child relationships.

## Authentication

Most endpoints require authentication. Reading comments is public, but creating, updating, and deleting comments requires user authentication.

## Endpoints

### 1. Get Comment by ID

```
GET /api/comments/:comment_id
```

Returns detailed information about a specific comment.

**Path Parameters:**

- `comment_id`: Comment ID (integer, minimum: 1)

**Response:**

```json
{
  "id": 1,
  "content": "Great post! Thanks for sharing this information.",
  "user_id": 456,
  "post_id": 123,
  "parent_id": null,
  "rating": 8,
  "created_at": "2024-01-15T12:00:00.000Z",
  "updated_at": "2024-01-15T12:00:00.000Z",
  "deleted_at": null,
  "author": {
    "id": 456,
    "login": "commenter_user",
    "avatar": "avatar2.jpg"
  },
  "post": {
    "id": 123,
    "title": "Introduction to Node.js"
  },
  "replies": [
    {
      "id": 2,
      "content": "You're welcome!",
      "user_id": 123,
      "post_id": 123,
      "parent_id": 1,
      "rating": 3,
      "created_at": "2024-01-15T12:30:00.000Z",
      "updated_at": "2024-01-15T12:30:00.000Z",
      "deleted_at": null,
      "author": {
        "id": 123,
        "login": "post_author",
        "avatar": "avatar.jpg"
      }
    }
  ]
}
```

### 2. Create Comment

```
POST /api/comments
```

Creates a new comment on a post or as a reply to another comment.

**Authentication:** Required

**Request Body:**

```json
{
  "content": "This is a great post! I learned a lot from it.",
  "parent_id": null
}
```

**Validation Rules:**

- `content`: 1-5000 characters (required)
- `parent_id`: Optional parent comment ID for creating replies

**Response:**

```json
{
  "id": 3,
  "content": "This is a great post! I learned a lot from it.",
  "user_id": 789,
  "post_id": 123,
  "parent_id": null,
  "rating": 0,
  "created_at": "2024-01-15T13:00:00.000Z",
  "updated_at": "2024-01-15T13:00:00.000Z",
  "deleted_at": null
}
```

### 3. Create Reply to Comment

```
POST /api/comments
```

Creates a reply to an existing comment.

**Authentication:** Required

**Request Body:**

```json
{
  "content": "I agree with your point about performance optimization.",
  "parent_id": 1
}
```

**Validation Rules:**

- `content`: 1-5000 characters (required)
- `parent_id`: Parent comment ID (required for replies)

**Response:**

```json
{
  "id": 4,
  "content": "I agree with your point about performance optimization.",
  "user_id": 789,
  "post_id": 123,
  "parent_id": 1,
  "rating": 0,
  "created_at": "2024-01-15T13:15:00.000Z",
  "updated_at": "2024-01-15T13:15:00.000Z",
  "deleted_at": null
}
```

### 4. Update Comment

```
PATCH /api/comments/:comment_id
```

Updates an existing comment. Only the comment author can update their comments.

**Authentication:** Required (comment owner only)

**Path Parameters:**

- `comment_id`: Comment ID (integer, minimum: 1)

**Request Body:**

```json
{
  "content": "Updated comment content with additional thoughts."
}
```

**Validation Rules:**

- `content`: 1-5000 characters (required)

**Response:**

```json
{
  "id": 3,
  "content": "Updated comment content with additional thoughts.",
  "user_id": 789,
  "post_id": 123,
  "parent_id": null,
  "rating": 0,
  "created_at": "2024-01-15T13:00:00.000Z",
  "updated_at": "2024-01-15T14:00:00.000Z",
  "deleted_at": null
}
```

### 5. Delete Comment

```
DELETE /api/comments/:comment_id
```

Soft deletes a comment. Only the comment author can delete their comments.

**Authentication:** Required (comment owner only)

**Path Parameters:**

- `comment_id`: Comment ID (integer, minimum: 1)

**Response:**

- Success: 204 No Content

### 6. Get Comment Likes

```
GET /api/comments/:comment_id/like
```

Returns all likes for a specific comment.

**Path Parameters:**

- `comment_id`: Comment ID (integer, minimum: 1)

**Response:**

```json
{
  "likes": [
    {
      "id": 1,
      "user_id": 456,
      "comment_id": 1,
      "is_like": true,
      "created_at": "2024-01-15T12:15:00.000Z",
      "user": {
        "id": 456,
        "login": "liker_user",
        "avatar": "avatar3.jpg"
      }
    },
    {
      "id": 2,
      "user_id": 789,
      "comment_id": 1,
      "is_like": false,
      "created_at": "2024-01-15T12:20:00.000Z",
      "user": {
        "id": 789,
        "login": "disliker_user",
        "avatar": "avatar4.jpg"
      }
    }
  ]
}
```

### 7. Like/Dislike Comment

```
POST /api/comments/:comment_id/like
POST /api/comments/:comment_id/dislike
```

Likes or dislikes a comment. If the user has already liked/disliked, it toggles the action.

**Authentication:** Required

**Path Parameters:**

- `comment_id`: Comment ID (integer, minimum: 1)

**Request Body (optional):**

```json
{
  "action": "like"
}
```

**Response:**

```json
{
  "message": "Comment liked successfully"
}
```

### 8. Remove Like/Dislike from Comment

```
DELETE /api/comments/:comment_id/like
```

Removes the user's like or dislike from a comment.

**Authentication:** Required

**Path Parameters:**

- `comment_id`: Comment ID (integer, minimum: 1)

**Response:**

```json
{
  "message": "Like removed successfully"
}
```

## Error Responses

### 400 Bad Request

```json
{
  "errors": [
    {
      "property": "content",
      "constraints": {
        "minLength": "content must be longer than or equal to 1 characters"
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
  "error": "You can only edit your own comments"
}
```

### 404 Not Found

```json
{
  "error": "Comment not found"
}
```

## Database Schema

The comment system utilizes the following table:

### `comment` table

- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `content` (TEXT, NOT NULL)
- `user_id` (INT, FOREIGN KEY to user.id)
- `post_id` (INT, FOREIGN KEY to post.id)
- `parent_id` (INT, FOREIGN KEY to comment.id, NULLABLE)
- `rating` (INT, DEFAULT 0)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)
- `deleted_at` (DATETIME, NULLABLE) - Soft delete

### `like` table

- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `user_id` (INT, FOREIGN KEY to user.id)
- `post_id` (INT, FOREIGN KEY to post.id, NULLABLE)
- `comment_id` (INT, FOREIGN KEY to comment.id, NULLABLE)
- `is_like` (BOOLEAN, NOT NULL)
- `created_at` (DATETIME)
- Unique constraint on (user_id, comment_id)

## Comment Threading

The comment system supports nested comments (replies) through the `parent_id` field:

- **Top-level comments**: `parent_id` is `null`
- **Replies**: `parent_id` references the parent comment's ID
- **Nested replies**: Can have multiple levels of nesting

## Comment Rating System

Comments use a rating system based on likes and dislikes:

- Each like increases the rating by 1
- Each dislike decreases the rating by 1
- Users can change their vote (like to dislike or vice versa)
- Users can remove their vote entirely

## Usage Examples

### Create a top-level comment

```bash
curl -X POST http://localhost:3000/api/comments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "This is a great post!", "parent_id": null}'
```

### Create a reply to a comment

```bash
curl -X POST http://localhost:3000/api/comments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "I agree with your point.", "parent_id": 1}'
```

### Update a comment

```bash
curl -X PATCH http://localhost:3000/api/comments/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Updated comment with more details."}'
```

### Like a comment

```bash
curl -X POST http://localhost:3000/api/comments/1/like \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Get comment likes

```bash
curl -X GET http://localhost:3000/api/comments/1/like
```

### Delete a comment

```bash
curl -X DELETE http://localhost:3000/api/comments/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
