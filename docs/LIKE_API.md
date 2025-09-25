# Like API Documentation

The Like API manages likes and dislikes for both posts and comments. Users can like, dislike, or remove their reactions to content. The system tracks user interactions and provides rating calculations.

## Authentication

All like/dislike operations require user authentication.

## Endpoints

### 1. Get Entity Likes

```
GET /api/posts/:post_id/like
GET /api/comments/:comment_id/like
```

Returns all likes and dislikes for a specific post or comment.

**Path Parameters:**

- `post_id`: Post ID (integer, minimum: 1) - for posts
- `comment_id`: Comment ID (integer, minimum: 1) - for comments

**Response (for posts):**

```json
{
  "likes": [
    {
      "id": 1,
      "user_id": 456,
      "post_id": 123,
      "is_like": true,
      "created_at": "2024-01-15T12:00:00.000Z",
      "user": {
        "id": 456,
        "login": "john_doe",
        "avatar": "avatar.jpg"
      }
    },
    {
      "id": 2,
      "user_id": 789,
      "post_id": 123,
      "is_like": false,
      "created_at": "2024-01-15T12:15:00.000Z",
      "user": {
        "id": 789,
        "login": "jane_smith",
        "avatar": "avatar2.jpg"
      }
    }
  ]
}
```

**Response (for comments):**

```json
{
  "likes": [
    {
      "id": 3,
      "user_id": 456,
      "comment_id": 456,
      "is_like": true,
      "created_at": "2024-01-15T12:30:00.000Z",
      "user": {
        "id": 456,
        "login": "john_doe",
        "avatar": "avatar.jpg"
      }
    }
  ]
}
```

### 2. Like Post/Comment

```
POST /api/posts/:post_id/like
POST /api/comments/:comment_id/like
```

Likes a post or comment. If the user has already reacted, it updates their reaction.

**Authentication:** Required

**Path Parameters:**

- `post_id`: Post ID (integer, minimum: 1) - for posts
- `comment_id`: Comment ID (integer, minimum: 1) - for comments

**Request Body (optional):**

```json
{
  "action": "like"
}
```

**Response:**

```json
{
  "message": "Post liked successfully"
}
```

### 3. Dislike Post/Comment

```
POST /api/posts/:post_id/dislike
POST /api/comments/:comment_id/dislike
```

Dislikes a post or comment. If the user has already reacted, it updates their reaction.

**Authentication:** Required

**Path Parameters:**

- `post_id`: Post ID (integer, minimum: 1) - for posts
- `comment_id`: Comment ID (integer, minimum: 1) - for comments

**Request Body (optional):**

```json
{
  "action": "dislike"
}
```

**Response:**

```json
{
  "message": "Post disliked successfully"
}
```

### 4. Remove Like/Dislike

```
DELETE /api/posts/:post_id/like
DELETE /api/comments/:comment_id/like
```

Removes the user's like or dislike from a post or comment.

**Authentication:** Required

**Path Parameters:**

- `post_id`: Post ID (integer, minimum: 1) - for posts
- `comment_id`: Comment ID (integer, minimum: 1) - for comments

**Response:**

```json
{
  "message": "Like removed successfully"
}
```

## Like System Behavior

### Reaction States

1. **No Reaction**: User has not liked or disliked the content
2. **Like**: User has liked the content (`is_like: true`)
3. **Dislike**: User has disliked the content (`is_like: false`)

### State Transitions

- **No Reaction → Like**: User likes the content
- **No Reaction → Dislike**: User dislikes the content
- **Like → Dislike**: User changes from like to dislike
- **Dislike → Like**: User changes from dislike to like
- **Like → No Reaction**: User removes their like
- **Dislike → No Reaction**: User removes their dislike

### Rating Calculation

The rating for posts and comments is calculated as:

```
rating = likes_count - dislikes_count
```

Where:

- `likes_count`: Number of likes (`is_like: true`)
- `dislikes_count`: Number of dislikes (`is_like: false`)

## Error Responses

### 400 Bad Request

```json
{
  "error": "Invalid post ID"
}
```

```json
{
  "error": "Invalid comment ID"
}
```

### 401 Unauthorized

```json
{
  "error": "Invalid or expired access token"
}
```

### 404 Not Found

```json
{
  "error": "Post not found"
}
```

```json
{
  "error": "Comment not found"
}
```

## Database Schema

The like system utilizes the following table:

### `like` table

- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `user_id` (INT, FOREIGN KEY to user.id)
- `post_id` (INT, FOREIGN KEY to post.id, NULLABLE)
- `comment_id` (INT, FOREIGN KEY to comment.id, NULLABLE)
- `is_like` (BOOLEAN, NOT NULL)
- `created_at` (DATETIME)
- Unique constraint on (user_id, post_id) when post_id is not null
- Unique constraint on (user_id, comment_id) when comment_id is not null

**Constraints:**

- Either `post_id` or `comment_id` must be provided (not both)
- A user can only have one reaction per post or comment
- The unique constraints ensure users cannot like/dislike the same content multiple times

## Usage Examples

### Like a post

```bash
curl -X POST http://localhost:3000/api/posts/123/like \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Dislike a post

```bash
curl -X POST http://localhost:3000/api/posts/123/dislike \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Get all likes for a post

```bash
curl -X GET http://localhost:3000/api/posts/123/like \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Remove like from a post

```bash
curl -X DELETE http://localhost:3000/api/posts/123/like \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Like a comment

```bash
curl -X POST http://localhost:3000/api/comments/456/like \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Get all likes for a comment

```bash
curl -X GET http://localhost:3000/api/comments/456/like \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Dislike a comment

```bash
curl -X POST http://localhost:3000/api/comments/456/dislike \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Remove dislike from a comment

```bash
curl -X DELETE http://localhost:3000/api/comments/456/like \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Integration Notes

### Post Rating Updates

When likes/dislikes are added, removed, or changed, the post's rating should be automatically updated in the database.

### Comment Rating Updates

Similarly, comment ratings should be updated when their likes/dislikes change.

### Real-time Updates

Consider implementing real-time updates for like counts to provide immediate feedback to users.

### Rate Limiting

Consider implementing rate limiting to prevent spam-like behavior and ensure system stability.
