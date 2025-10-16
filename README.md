# Usof Backend

In progress...

> A simplified Stack Overflow API clone. Implements authentication, user management, posts, cascading comments, and more.

**Status:** 50 endpoints implemented. (all)

---

## Table of Contents

- [Task PDF](./docs/Task.pdf)
- [API documentation](./docs/API.md)
- [Requirements](#requirements)
- [Stack & Technologies](#stack--used-technologies)
- [Key Features](#key-features)
- [Installation & Usage](#installation--usage)

---

## Stack & Used Technologies

- JavaScript / TypeScript
- Node.js
- Docker Compose
- MySQL
- [class-transformer](https://github.com/typestack/class-transformer) & [class-validator](https://github.com/typestack/class-validator)
- [Sharp](https://github.com/lovell/sharp)
- [Multer](https://github.com/expressjs/multer#readme)
- [AdminJS](https://adminjs.co/)
- [Nodemailer](https://nodemailer.com/)
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [jsdom](https://github.com/jsdom/jsdom)

## Requirements

- JavaScript / TypeScript
- Node.js
- Express.js
- MySQL
- MVC architecture
- No ORM

## Key Features

- User authentication and registration, refresh tokens
- Post creation, editing, and deletion
- Cascade comments
- Likes and dislikes for posts and comments, which change author's profile rating
- Categories
- Email verification and password reset
- Admin panel (AdminJS)
- File uploads (avatars, post images)
- - Support for animated avatars
- Input validation and sanitization

---

## Installation & Usage

### Prerequisites

- [Node.js v24 & npm](https://nodejs.org/en/download)
- [Docker](https://www.docker.com/get-started/)

### Getting Started

1. **Clone the repository:**
   ```sh
   git clone https://github.com/pvlvld/Usof-Backend
   cd Usof-Backend
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure environment variables:**
   - Copy `example.env` to `.env` and set up SMTP and other required variables.
   ```sh
   	cp example.env .env
   ```
4. **Start the database:**
   (You can modify the schema or seed data in the `./init_scripts` folder.)
   (Production: remove `./init_scripts/03-seed-example-data.sql` to avoid inserting example data.)
   ```sh
   docker compose up -d
   ```
   To verify the database is running, check that the `usof_mysql` container is present and has an "Up" status:
   ```sh
   docker ps
   ```
5. **Compile TypeScript:**
   ```sh
   npm run build
   ```
6. **Run the application:**
   - Development mode (with file watching):
     ```sh
     npm run start:dev
     ```
   - Production mode (PM2 with logs & auto-restart):
     ```sh
     npm run start:pm2
     ```

---

## Notes

- This project is for educational purposes and does not use an ORM.
- If some choices or solutions seem unusual, please check if that's not a requirement from the PDF assignment.
- You might encounter issues when deleting the ./mysql_data folder. If so, use sudo.
- Post images are not finished, but all the logic is ready. It just requires to pick the request structure. Check the [uploadImage.middleware.ts](./src/shared/middlewares/uploadImage.middleware.ts)

---

## License

This project is published under ISC license.
