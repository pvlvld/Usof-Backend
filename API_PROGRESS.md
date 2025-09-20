# API Development Progress Tracker

This document provides an overview of the API development process, listing required, optional, and additional features along with their implementation status. It serves as a reference for tracking progress and planning next steps throughout the project. Features are grouped by area, and notes are included for clarity where needed.

**Legend:**

- - [ ] — Feature not yet implemented
- - [x] — Feature completed
- **Additional** — Feature proposed by me
- **Optional** — Recommended extra feature
- All other items are from the main requirements

# TODO
- [ ]  Remove target from validation errors

# Auth
- [x]  POST - /api/auth/register - registration of a new user, required parameters are [login, password, password confirmation, email]
- [x]  POST - /api/auth/login - log in user, required parameters are [login, email, password]. Only users with a confirmed email can sign in
- [x]  POST - /api/auth/logout - log out authorized user
- [ ]  POST - /api/auth/password-reset - send a reset link to user email, required parameter is [email]
- [ ]  POST - /api/auth/password-reset/:confirm_token - confirm new password with a token from email, required parameter is a [new password]

Additional:
- [x]  POST - /token/refresh - refresh tokens using refreshToken


# User
- [x]  GET - /api/users get all users (page)
- - [x]  Additional: ?page=
- - [x]  Additional: ?limit=
- - [x]  Additional: ?sort=
- - [x]  Additional: ?order=
- - [x]  Additional: exclude soft deleted users
- [x]  GET - /api/users/:user_id get specified user data
- [x]  POST - /api/users create a new user, required parameters are [login, password, password confirmation, email, role].
- - [x]  Admins only
- [x]  PATCH - /api/users/avatar upload user avatar
- - [x]  Additional: Resize & compress
- - [x]  Additional: Convert all to webp
- - [x]  Additional: Allow animated avatars for donators
- [x]  PATCH /api/users/:user_id update user data
- - [x]  Additional: Partial update?
- [x]  DELETE - /api/users/:user_id delete user
- - [x] Additional: soft delete

Aditional:
- [x]  GET /api/users/:user_id/avatar
- - [x]  Serve a default pfp if the user does not have one
- [x]  POST - /api/users/:user_id/ban ban user untill / permanent (epoch)
- [x]  POST - /api/users/:user_id/unban unban user

# Post
- [ ]  GET /api/posts get all posts. This endpoint doesn't require any role, it is public. If there are too many posts, you must implement pagination. Page size is up to you.
- - [ ]  Additional: ?page=
- - [ ]  Additional: ?limit=
- - [ ]  Additional: ?sort=
- - [ ]  Additional: ?order=
- [x]  GET /api/posts/:post_id get specified post data. Endpoint is public.
- - [x]  Additional: Admins can view deleted posts
- [ ]  GET /api/posts/:post_id/comments get all comments for the specified post. Endpoint is
public.
- [ ]  POST /api/posts/:post_id/comments create a new comment, required parameter is
[content]
- [ ]  GET /api/posts/:post_id/categories get all categories associated with the specified post
- [x]  GET /api/posts/:post_id/like get all likes under the specified post
- [ ]  POST /api/posts/ create a new post, required parameters are [title, content, categories]
- [x]  POST /api/posts/:post_id/like create a new like under a post
- [x]  Additional: POST /api/posts/:post_id/dislike create a new dislike under a post
- [ ]  PATCH /api/posts/:post_id update the specified post (its title, body or category).
- - [ ]  It's accessible only for the creator of the post
- [x]  DELETE /api/posts/:post_id delete a post
- - [x] Additional: Soft delete
- - [x] Additional: Users can delete only their own posts
- - [x] Additional: Admins can delete any post
- [x]  DELETE /api/posts/:post_id/like delete a like under a post

Don't forget about a feature that allows locking posts/comments. Think about how you will implement it.
You also must implement post sorting and filtering.

Every user must have the opportunity to sort all viewable posts:
- [ ]  by number of likes by default
- [ ]  by date

The user must have the opportunity to filter all viewable posts as well:
- [ ]  by categories
- [ ]  by date interval
- [ ]  by status

Optional:
- [ ]  implement an opportunity to add posts to the Favorites category, so that the user can quickly view all marked posts by going on the appropriate endpoint
- [ ]  allow users to subscribe to some posts that they want to follow and send them notifications when some kind of activity was made with the post (it was changed somehow or it was commented by somebody)

# Categories
- [x]  GET /api/categories get all categories
- [x]  GET /api/categories/:category_id get specified category data
- [ ]  GET /api/categories/:category_id/posts get all posts associated with the specified category
- [x]  POST /api/categories create a new category, required parameter is [title]
- [x]  PATCH /api/categories/:category_id update specified category data
- [x]  DELETE /api/categories/:category_id delete a category


Additional:
- [x]  Require admin auth for the creation, update, and delete.

# Comments
- [ ]  GET /api/comments/:comment_id get specified comment data
- [ ]  GET /api/comments/:comment_id/like get all likes under the specified comment
- [ ]  POST /api/comments/:comment_id/like create a new like under a comment
- [ ]  Additional: POST /api/comments/:comment_id/dislike create a new dislike under a comment
- [ ]  PATCH /api/comments/:comment_id update specified comment data
- [ ]  DELETE /api/comments/:comment_id delete a comment
- [ ]  DELETE /api/comments/:comment_id/like delete a like under a comment
