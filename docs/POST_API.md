# Post API Documentation

The Post API manages blog posts, including creation, updates, deletion, and retrieval with advanced filtering and sorting capabilities. Posts support categories, comments, and like/dislike functionality.

## Authentication

Most endpoints are public. Creation, updates, and deletion require authentication. Some operations are restricted to post owners or admins.

## Endpoints

### 1. Get All Posts

```
GET /api/posts
```

Returns a paginated list of all posts with advanced filtering and sorting options.

**Query Parameters:**

- `page` (optional): Page number (default: 1, minimum: 1)
- `limit` (optional): Items per page (default: 25, range: 1-100)
- `sort` (optional): Sort field - "id", "rating", "created_at", "updated_at" (default: "rating")
- `order` (optional): Sort order - "ASC" or "DESC" (default: "ASC")
- `categories` (optional): Filter by categories - "all" or comma-separated category names (default: "all")
- `status` (optional): Filter by status - "active", "inactive", "all" (default: "all")
- `user` (optional): Filter by user ID (default: 0 for all users)
- `from_date` (optional): Filter posts from this date (ISO 8601 format)
- `to_date` (optional): Filter posts until this date (ISO 8601 format)

**Response:**

```json
[
  {
    "id": 1,
    "title": "Introduction to Node.js",
    "content": "Node.js is a powerful JavaScript runtime...",
    "rating": 25,
    "comments_count": 69,
    "user_id": 123,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "deleted_at": null,
    "categories": [
      {
        "id": 1,
        "title": "Technology",
        "description": "Tech-related posts"
      }
    ],
    "author": {
      "id": 123,
      "login": "john_doe",
      "avatar": "avatar.jpg"
    }
  }
]
```

### 2. Get Post by ID

```
GET /api/posts/:post_id
```

Returns detailed information about a specific post.

**Path Parameters:**

- `post_id`: Post ID (integer, minimum: 1)

**Response:**

```json
{
  "id": 1,
  "title": "Introduction to Node.js",
  "content": "Node.js is a powerful JavaScript runtime...",
  "rating": 25,
  "user_id": 123,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z",
  "deleted_at": null,
  "categories": [
    {
      "id": 1,
      "title": "Technology",
      "description": "Tech-related posts"
    }
  ],
  "author": {
    "id": 123,
    "login": "john_doe",
    "avatar": "avatar.jpg"
  },
  "comments_count": 5,
  "likes_count": 25
}
```

### 3. Create Post

```
POST /api/posts
```

Creates a new post.

**Authentication:** Required

**Request Body:**

```json
{
  "title": "My First Post",
  "content": "This is the content of my post...",
  "categories": [1, 2, 3]
}
```

**Validation Rules:**

- `title`: 1-200 characters
- `content`: 1-5000 characters
- `categories`: Array of category IDs (integers)

**Response:**

```json
{
  "id": 2,
  "title": "My First Post",
  "content": "This is the content of my post...",
  "rating": 0,
  "user_id": 123,
  "created_at": "2024-01-15T11:00:00.000Z",
  "updated_at": "2024-01-15T11:00:00.000Z",
  "deleted_at": null,
  "categories": [
    {
      "id": 1,
      "title": "Technology"
    },
    {
      "id": 2,
      "title": "Programming"
    }
  ]
}
```

### 4. Update Post

```
PATCH /api/posts/:post_id
```

Updates an existing post. Only the post creator can update their posts.

**Authentication:** Required (post owner only)

**Path Parameters:**

- `post_id`: Post ID (integer, minimum: 1)

**Request Body (all fields optional):**

```json
{
  "title": "Updated Post Title",
  "content": "Updated post content...",
  "categories": [1, 4]
}
```

**Validation Rules:**

- `title`: 1-200 characters (if provided)
- `content`: 1-5000 characters (if provided)
- `categories`: Array of category IDs (if provided)

**Response:**

```json
{
  "id": 2,
  "title": "Updated Post Title",
  "content": "Updated post content...",
  "rating": 0,
  "user_id": 123,
  "created_at": "2024-01-15T11:00:00.000Z",
  "updated_at": "2024-01-15T12:00:00.000Z",
  "deleted_at": null,
  "categories": [
    {
      "id": 1,
      "title": "Technology"
    },
    {
      "id": 4,
      "title": "Web Development"
    }
  ]
}
```

### 5. Delete Post

```
DELETE /api/posts/:post_id
```

Soft deletes a post. Users can only delete their own posts, admins can delete any post.

**Authentication:** Required (post owner or admin)

**Path Parameters:**

- `post_id`: Post ID (integer, minimum: 1)

**Response:**

- Success: 204 No Content

### 6. Get Post Categories

```
GET /api/posts/:post_id/categories
```

Returns all categories associated with a specific post.

**Path Parameters:**

- `post_id`: Post ID (integer, minimum: 1)

**Response:**

```json
[
  {
    "id": 1,
    "title": "Technology",
    "description": "Tech-related posts"
  },
  {
    "id": 2,
    "title": "Programming",
    "description": "Programming tutorials and tips"
  }
]
```

### 7. Get Post Comments

```
GET /api/posts/:post_id/comments
```

Returns all comments for a specific post.

**Path Parameters:**

- `post_id`: Post ID (integer, minimum: 1)

**Response:**

```json
[
  {
    "id": 1,
    "content": "Great post!",
    "user_id": 456,
    "post_id": 1,
    "parent_id": null,
    "rating": 5,
    "created_at": "2024-01-15T12:00:00.000Z",
    "updated_at": "2024-01-15T12:00:00.000Z",
    "author": {
      "id": 456,
      "login": "commenter",
      "avatar": "avatar2.jpg"
    },
    "replies": [
      {
        "id": 2,
        "content": "Thanks!",
        "user_id": 123,
        "post_id": 1,
        "parent_id": 1,
        "rating": 2,
        "created_at": "2024-01-15T12:30:00.000Z",
        "updated_at": "2024-01-15T12:30:00.000Z",
        "author": {
          "id": 123,
          "login": "john_doe",
          "avatar": "avatar.jpg"
        }
      }
    ]
  }
]
```

### 8. Create Post Comment

```
POST /api/posts/:post_id/comments
```

Creates a new comment on a post.

**Authentication:** Required

**Path Parameters:**

- `post_id`: Post ID (integer, minimum: 1)

**Request Body:**

```json
{
  "content": "This is a great post!",
  "parent_id": null
}
```

**Validation Rules:**

- `content`: 1-5000 characters
- `parent_id`: Optional parent comment ID for replies

**Response:**

```json
{
  "id": 3,
  "content": "This is a great post!",
  "user_id": 456,
  "post_id": 1,
  "parent_id": null,
  "rating": 0,
  "created_at": "2024-01-15T13:00:00.000Z",
  "updated_at": "2024-01-15T13:00:00.000Z"
}
```

### 9. Get Post Likes

```
GET /api/posts/:post_id/like
```

Returns all likes for a specific post.

**Path Parameters:**

- `post_id`: Post ID (integer, minimum: 1)

**Response:**

```json
{
  "likes": [
    {
      "id": 1,
      "user_id": 456,
      "post_id": 1,
      "is_like": true,
      "created_at": "2024-01-15T12:00:00.000Z",
      "user": {
        "id": 456,
        "login": "liker",
        "avatar": "avatar2.jpg"
      }
    }
  ]
}
```

### 10. Like/Dislike Post

```
POST /api/posts/:post_id/like
POST /api/posts/:post_id/dislike
```

Likes or dislikes a post. If the user has already liked/disliked, it toggles the action.

**Authentication:** Required

**Path Parameters:**

- `post_id`: Post ID (integer, minimum: 1)

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

### 11. Remove Like/Dislike

```
DELETE /api/posts/:post_id/like
```

Removes the user's like or dislike from a post.

**Authentication:** Required

**Path Parameters:**

- `post_id`: Post ID (integer, minimum: 1)

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
      "property": "title",
      "constraints": {
        "minLength": "title must be longer than or equal to 1 characters"
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
  "error": "You can only update your own posts"
}
```

### 404 Not Found

```json
{
  "error": "Post not found"
}
```

### 410 Gone

```json
{
  "message": "Post has been deleted"
}
```

## Database Schema

The post system utilizes several tables:

### `post` table

- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `title` (VARCHAR(200), NOT NULL)
- `content` (TEXT, NOT NULL)
- `rating` (INT, DEFAULT 0)
- `user_id` (INT, FOREIGN KEY to user.id)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)
- `deleted_at` (DATETIME, NULLABLE) - Soft delete

### `post_categories` table

- `post_id` (INT, FOREIGN KEY to post.id)
- `category_id` (INT, FOREIGN KEY to category.id)
- Primary key on (post_id, category_id)

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
- Unique constraint on (user_id, post_id) or (user_id, comment_id)

## Sorting and Filtering

### Available Sort Fields

- **id**: Sort by post ID
- **rating**: Sort by number of likes (default)
- **created_at**: Sort by creation date
- **updated_at**: Sort by last update date

### Available Filters

- **categories**: Filter by category names (comma-separated)
- **status**: Filter by post status (active/inactive/all)
- **user**: Filter by specific user ID
- **date range**: Filter by creation date using from_date and to_date

## Usage Examples

### Get posts with filters

```bash
curl -X GET "http://localhost:3000/api/posts?categories=technology,programming&sort=rating&order=DESC&limit=10"
```

### Create a new post

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "My Post", "content": "Post content here", "categories": [1, 2]}'
```

### Like a post

```bash
curl -X POST http://localhost:3000/api/posts/123/like \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Get posts by date range

```bash
curl -X GET "http://localhost:3000/api/posts?from_date=2024-01-01T00:00:00.000Z&to_date=2024-01-31T23:59:59.000Z"
```
