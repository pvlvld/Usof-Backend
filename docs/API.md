# API Documentation

This document provides a comprehensive overview of the API endpoints and their implementation status. The API is organized into feature modules, each with detailed documentation available in separate files.

## 📊 Implementation Status

- **Required by the task**: 34/34 [x]
- **Additional features**: 15/15 [x]
- **Total endpoints**: 49/49 [x]

## 📚 Feature Documentation

- **[Authentication API](AUTH_API.md)** - User registration, login, logout, password reset, email verification, and token refresh
- **[User Management API](USER_API.md)** - User profiles, avatars, administrative functions, and user management
- **[Post API](POST_API.md)** - Blog posts with advanced filtering, sorting, categories, and comments
- **[Category API](CATEGORY_API.md)** - Post categories for content organization
- **[Comment API](COMMENT_API.md)** - Nested comments and replies with like/dislike functionality
- **[Like API](LIKE_API.md)** - Like and dislike system for posts and comments
- **[Collections API](COLLECTIONS_API.md)** - User collections for organizing and bookmarking posts

## 🏗️ Architecture Overview

The API is built with a modular architecture where each feature is self-contained with its own:

- Controller (business logic)
- Service (data operations)
- Model (database schema)
- DTO (data transfer objects)
- Router (endpoint definitions)

## 🔐 Authentication

Most endpoints require authentication via HTTP-only cookies containing JWT tokens:

- `accessToken`: Short-lived token (15 minutes)
- `refreshToken`: Long-lived token for refreshing access

## 📝 Legend

- [x] — Feature completed
- [ ] — Feature not yet implemented
- **Optional** — Recommended extra feature
- **Additional** — Feature proposed beyond requirements by me

## 🚧 TODO Items

- [ ] Remove target from validation errors
- [ ] Use unsigned int for AUTO_INCREMENT DB columns
- [ ] Implement rate limiting
- [ ] Implement per day action limits dependent on the user role
- [ ] Create config service
- [ ] Revise the list of allowed HTML tags for user input sanitization

## 🔐 Authentication Endpoints

| Method | Endpoint                                  | Description                               | Status |
| ------ | ----------------------------------------- | ----------------------------------------- | ------ |
| POST   | `/api/auth/register`                      | Register new user with email verification | [x]    |
| POST   | `/api/auth/login`                         | Login user (verified email required)      | [x]    |
| POST   | `/api/auth/logout`                        | Logout authorized user                    | [x]    |
| POST   | `/api/auth/password-reset`                | Send password reset link to email         | [x]    |
| POST   | `/api/auth/password-reset/:confirm_token` | Reset password with token                 | [x]    |
| POST   | `/api/auth/verify-email/:confirm_token`   | Verify user email address                 | [x]    |
| POST   | `/api/auth/token/refresh`                 | **Additional**: Refresh access tokens     | [x]    |

## 👤 User Management Endpoints

| Method | Endpoint                     | Description                               | Status |
| ------ | ---------------------------- | ----------------------------------------- | ------ |
| GET    | `/api/users`                 | Get all users with pagination & filtering | [x]    |
| GET    | `/api/users/:user_id`        | Get specific user data                    | [x]    |
| POST   | `/api/users`                 | Create new user (admin only)              | [x]    |
| PATCH  | `/api/users/avatar`          | Upload user avatar with processing        | [x]    |
| PATCH  | `/api/users/:user_id`        | Update user data (owner/admin)            | [x]    |
| DELETE | `/api/users/:user_id`        | Soft delete user                          | [x]    |
| GET    | `/api/users/:user_id/avatar` | **Additional**: Get user avatar           | [x]    |
| POST   | `/api/users/:user_id/ban`    | **Additional**: Ban user                  | [x]    |
| POST   | `/api/users/:user_id/unban`  | **Additional**: Unban user                | [x]    |

**Additional Features:**

- [x] Pagination with `page`, `limit`, `sort`, `order` parameters
- [x] Exclude soft deleted users
- [x] Avatar resizing, compression, and WebP conversion
- [x] Animated avatars for donators
- [x] Partial updates supported
- [x] Default avatar fallback

## 📝 Post Management Endpoints

| Method | Endpoint                         | Description                                        | Status |
| ------ | -------------------------------- | -------------------------------------------------- | ------ |
| GET    | `/api/posts`                     | Get all posts with advanced filtering & pagination | [x]    |
| GET    | `/api/posts/:post_id`            | Get specific post data (public)                    | [x]    |
| POST   | `/api/posts`                     | Create new post (authenticated)                    | [x]    |
| PATCH  | `/api/posts/:post_id`            | Update post (owner only)                           | [x]    |
| DELETE | `/api/posts/:post_id`            | Delete post (owner/admin)                          | [x]    |
| GET    | `/api/posts/:post_id/comments`   | Get post comments (public)                         | [x]    |
| POST   | `/api/posts/:post_id/comments`   | Create comment on post                             | [x]    |
| GET    | `/api/posts/:post_id/categories` | Get post categories                                | [x]    |
| GET    | `/api/posts/:post_id/like`       | Get post likes                                     | [x]    |
| POST   | `/api/posts/:post_id/like`       | Like post                                          | [x]    |
| POST   | `/api/posts/:post_id/dislike`    | **Additional**: Dislike post                       | [x]    |
| DELETE | `/api/posts/:post_id/like`       | Remove like/dislike from post                      | [x]    |

**Advanced Features:**

- [x] **Pagination**: `page`, `limit` parameters
- [x] **Sorting**: `sort` (rating, id, created_at, updated_at), `order` (ASC/DESC)
- [x] **Filtering**: `categories`, `status`, `user`, `from_date`, `to_date`
- [x] **Soft Delete**: Users can delete own posts, admins can delete any
- [x] **Admin Access**: Admins can view deleted posts
- [x] **Collections**: Posts can be added to user collections

**Sorting Options:**

- [x] By rating (default)
- [x] By creation date
- [x] By update date
- [x] By ID

**Filtering Options:**

- [x] By categories (comma-separated)
- [x] By date interval
- [x] By status (active/inactive)
- [x] By user ID

**Optional Features:**

- [x] Collections system for favorites
- [ ] Post subscription notifications
- [ ] Support for adding images
- - [x] Image upload middleware
- - [x] User content sanitization

## 🏷️ Category Management Endpoints

| Method | Endpoint                             | Description                         | Status |
| ------ | ------------------------------------ | ----------------------------------- | ------ |
| GET    | `/api/categories`                    | Get all categories (public)         | [x]    |
| GET    | `/api/categories/:category_id`       | Get specific category data (public) | [x]    |
| GET    | `/api/categories/:category_id/posts` | Get posts in category (public)      | [x]    |
| POST   | `/api/categories`                    | Create new category (admin only)    | [x]    |
| PATCH  | `/api/categories/:category_id`       | Update category (admin only)        | [x]    |
| DELETE | `/api/categories/:category_id`       | Delete category (admin only)        | [x]    |

**Additional Features:**

- [x] Admin authentication required for CUD operations

## 📚 Collections Management Endpoints

| Method | Endpoint                                           | Description                 | Status |
| ------ | -------------------------------------------------- | --------------------------- | ------ |
| GET    | `/api/collections`                                 | Get user's collections      | [x]    |
| POST   | `/api/collections`                                 | Create new collection       | [x]    |
| GET    | `/api/collections/:collection_name`                | Get collection details      | [x]    |
| GET    | `/api/collections/:collection_name/posts`          | Get posts in collection     | [x]    |
| PATCH  | `/api/collections/:collection_name`                | Update collection           | [x]    |
| DELETE | `/api/collections/:collection_name`                | Delete collection           | [x]    |
| POST   | `/api/collections/:collection_name/posts`          | Add post to collection      | [x]    |
| DELETE | `/api/collections/:collection_name/posts/:post_id` | Remove post from collection | [x]    |

## 💬 Comment Management Endpoints

| Method | Endpoint                            | Description                      | Status |
| ------ | ----------------------------------- | -------------------------------- | ------ |
| GET    | `/api/comments/:comment_id`         | Get specific comment data        | [x]    |
| POST   | `/api/comments`                     | Create new comment or reply      | [x]    |
| PATCH  | `/api/comments/:comment_id`         | Update comment (owner only)      | [x]    |
| DELETE | `/api/comments/:comment_id`         | Delete comment (owner only)      | [x]    |
| GET    | `/api/comments/:comment_id/like`    | Get comment likes                | [x]    |
| POST   | `/api/comments/:comment_id/like`    | Like comment                     | [x]    |
| POST   | `/api/comments/:comment_id/dislike` | **Additional**: Dislike comment  | [x]    |
| DELETE | `/api/comments/:comment_id/like`    | Remove like/dislike from comment | [x]    |

**Additional Features:**

- [x] Nested comments (replies) support
- [x] Comment threading with parent-child relationships
