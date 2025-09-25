# Category API Documentation

The Category API manages post categories, allowing administrators to create, update, and delete categories that can be used to organize posts. Categories help users find content by topic.

## Authentication

Most endpoints are public for reading categories. Creating, updating, and deleting categories requires admin authentication.

## Endpoints

### 1. Get All Categories

```
GET /api/categories
```

Returns a list of all available categories.

**Response:**

```json
[
  {
    "id": 1,
    "title": "Technology",
    "description": "Posts about technology, programming, and software development",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "posts_count": 25
  },
  {
    "id": 2,
    "title": "Programming",
    "description": "Programming tutorials, tips, and best practices",
    "created_at": "2024-01-15T10:35:00.000Z",
    "updated_at": "2024-01-15T10:35:00.000Z",
    "posts_count": 18
  }
]
```

### 2. Get Category by ID

```
GET /api/categories/:category_id
```

Returns detailed information about a specific category.

**Path Parameters:**

- `category_id`: Category ID (integer, minimum: 1)

**Response:**

```json
{
  "id": 1,
  "title": "Technology",
  "description": "Posts about technology, programming, and software development",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z",
  "posts_count": 25
}
```

### 3. Get Posts by Category

```
GET /api/categories/:category_id/posts
```

Returns all posts associated with a specific category.

**Path Parameters:**

- `category_id`: Category ID (integer, minimum: 1)

**Response:**

```json
[
  {
    "id": 1,
    "title": "Introduction to Node.js",
    "content": "Node.js is a powerful JavaScript runtime...",
    "rating": 25,
    "user_id": 123,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "deleted_at": null,
    "author": {
      "id": 123,
      "login": "john_doe",
      "avatar": "avatar.jpg"
    },
    "categories": [
      {
        "id": 1,
        "title": "Technology"
      }
    ]
  }
]
```

### 4. Create Category (Admin Only)

```
POST /api/categories
```

Creates a new category.

**Authentication:** Admin required

**Request Body:**

```json
{
  "title": "Web Development",
  "description": "Posts about web development, frontend and backend technologies"
}
```

**Validation Rules:**

- `title`: 1-32 characters (required)
- `description`: 1-128 characters (optional)

**Response:**

```json
{
  "id": 3,
  "title": "Web Development",
  "description": "Posts about web development, frontend and backend technologies",
  "created_at": "2024-01-15T11:00:00.000Z",
  "updated_at": "2024-01-15T11:00:00.000Z",
  "posts_count": 0
}
```

### 5. Update Category (Admin Only)

```
PATCH /api/categories/:category_id
```

Updates an existing category.

**Authentication:** Admin required

**Path Parameters:**

- `category_id`: Category ID (integer, minimum: 1)

**Request Body (all fields optional):**

```json
{
  "title": "Updated Category Title",
  "description": "Updated category description"
}
```

**Validation Rules:**

- `title`: 1-32 characters (if provided)
- `description`: 1-128 characters (if provided)

**Response:**

```json
{
  "id": 3,
  "title": "Updated Category Title",
  "description": "Updated category description",
  "created_at": "2024-01-15T11:00:00.000Z",
  "updated_at": "2024-01-15T12:00:00.000Z",
  "posts_count": 5
}
```

### 6. Delete Category (Admin Only)

```
DELETE /api/categories/:category_id
```

Deletes a category. Note: This may affect posts that reference this category.

**Authentication:** Admin required

**Path Parameters:**

- `category_id`: Category ID (integer, minimum: 1)

**Response:**

```json
{
  "message": "Category deleted"
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
  "error": "Admin access required"
}
```

### 404 Not Found

```json
{
  "error": "Category not found"
}
```

## Database Schema

The category system utilizes the following table:

### `category` table

- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `title` (VARCHAR(32), UNIQUE, NOT NULL)
- `description` (VARCHAR(128), NULLABLE)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

### `post_categories` table (Junction table)

- `post_id` (INT, FOREIGN KEY to post.id)
- `category_id` (INT, FOREIGN KEY to category.id)
- Primary key on (post_id, category_id)

## Category Management

### Creating Categories

Categories should be created with descriptive titles and optional descriptions to help users understand what type of content belongs in each category.

### Best Practices

- Use clear, concise category names
- Provide helpful descriptions for better user experience
- Avoid creating too many similar categories
- Consider the content organization needs of your platform

### Category Relationships

Categories have a many-to-many relationship with posts:

- A post can belong to multiple categories
- A category can contain multiple posts
- Categories are used for filtering and organizing content

## Usage Examples

### Get all categories

```bash
curl -X GET http://localhost:3000/api/categories
```

### Create a new category (Admin)

```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Data Science", "description": "Posts about data analysis, machine learning, and statistics"}'
```

### Get posts in a category

```bash
curl -X GET http://localhost:3000/api/categories/1/posts
```

### Update category (Admin)

```bash
curl -X PATCH http://localhost:3000/api/categories/1 \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Technology & Innovation", "description": "Latest technology trends and innovations"}'
```

### Delete category (Admin)

```bash
curl -X DELETE http://localhost:3000/api/categories/1 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```
