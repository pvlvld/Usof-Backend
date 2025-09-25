# Collections API Documentation

The Collections API allows users to create named collections and organize posts within them. This provides a way for users to bookmark and categorize posts for quick access.

## Authentication

All endpoints require authentication. Include the `Authorization: Bearer <token>` header in your requests.

## Endpoints

### 1. Get User's Collections

```
GET /api/collections
```

Returns a list of all collections created by the authenticated user.

**Response:**

```json
[
  {
    "id": 1,
    "user_id": 123,
    "name": "My Favorites",
    "description": "Posts I want to revisit",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
]
```

### 2. Create a New Collection

```
POST /api/collections
```

Creates a new collection for the authenticated user.

**Request Body:**

```json
{
  "name": "My Favorites",
  "description": "Posts I want to revisit" // optional
}
```

**Response:**

```json
{
  "id": 1,
  "user_id": 123,
  "name": "My Favorites",
  "description": "Posts I want to revisit",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### 3. Get Collection Details

```
GET /api/collections/:collection_name
```

Returns details about a specific collection.

**Response:**

```json
{
  "id": 1,
  "user_id": 123,
  "name": "My Favorites",
  "description": "Posts I want to revisit",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### 4. Get Posts in Collection

```
GET /api/collections/:collection_name/posts
```

Returns all posts in a specific collection with their details.

**Response:**

```json
{
  "id": 1,
  "user_id": 123,
  "name": "My Favorites",
  "description": "Posts I want to revisit",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z",
  "posts": [
    {
      "id": 456,
      "title": "Interesting Post",
      "content": "This is the post content...",
      "rating": 15,
      "created_at": "2024-01-14T09:00:00.000Z",
      "added_at": "2024-01-15T10:35:00.000Z"
    }
  ]
}
```

### 5. Update Collection

```
PATCH /api/collections/:collection_name
```

Updates a collection's name and/or description.

**Request Body:**

```json
{
  "name": "Updated Name", // optional
  "description": "Updated description" // optional
}
```

**Response:**

```json
{
  "id": 1,
  "user_id": 123,
  "name": "Updated Name",
  "description": "Updated description",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T11:00:00.000Z"
}
```

### 6. Delete Collection

```
DELETE /api/collections/:collection_name
```

Deletes a collection and removes all posts from it.

**Response:**

```json
{
  "message": "Collection \"My Favorites\" deleted successfully"
}
```

### 7. Add Post to Collection

```
POST /api/collections/:collection_name/posts
```

Adds a post to a collection.

**Request Body:**

```json
{
  "post_id": 456
}
```

**Response:**

```json
{
  "message": "Post 456 added to collection \"My Favorites\""
}
```

### 8. Remove Post from Collection

```
DELETE /api/collections/:collection_name/posts/:post_id
```

Removes a post from a collection.

**Response:**

```json
{
  "message": "Post 456 removed from collection \"My Favorites\""
}
```

## Error Responses

### 400 Bad Request

```json
{
  "errors": [
    {
      "property": "name",
      "constraints": {
        "minLength": "name must be longer than or equal to 1 characters"
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

### 404 Not Found

```json
{
  "error": "Collection \"NonExistent\" not found"
}
```

### 409 Conflict

```json
{
  "error": "Collection with name \"My Favorites\" already exists"
}
```

## Database Schema

The implementation utilizes two tables:

### `collection` table

- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `user_id` (INT, FOREIGN KEY to user.id)
- `name` (VARCHAR(100), NOT NULL)
- `description` (VARCHAR(255), NULLABLE)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)
- Unique constraint on (user_id, name)

### `collection_posts` table

- `collection_id` (INT, FOREIGN KEY to collection.id)
- `post_id` (INT, FOREIGN KEY to post.id)
- `added_at` (DATETIME)
- Primary key on (collection_id, post_id)

## Usage Examples

### Create a collection and add posts

```bash
# Create collection
curl -X POST http://localhost:3000/api/collections \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Tech Articles", "description": "Interesting tech posts"}'

# Add post to collection
curl -X POST http://localhost:3000/api/collections/Tech%20Articles/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"post_id": 123}'

# Get posts in collection
curl -X GET http://localhost:3000/api/collections/Tech%20Articles/posts \
  -H "Authorization: Bearer YOUR_TOKEN"
```
