
# Usof Backend
In progress...
> A simplified Stack Overflow API clone. Implements authentication, user management, posts, cascading comments, and more.

**Status:** 41 endpoints implemented. (all)

---

## Table of Contents
- [Task PDF](https://github.com/pvlvld/Usof-Backend/blob/main/Task.pdf)
- [Progress Tracker / TODO](./API_PROGRESS.md)
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
- User authentication and registration
- Post creation, editing, and deletion
- Cascade comments
- Likes and categories
- Email verification and password reset
- Admin panel (AdminJS)
- File uploads (avatars, post images)
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
3. **Start the database:**
	(You can modify the schema or seed data in the `./init_scripts` folder.)
	```sh
	docker compose up -d
	```
	To verify the database is running, check that the `usof_mysql` container is present and has an "Up" status:
	```sh
	docker ps
	```
4. **Configure environment variables:**
	- Copy `example.env` to `.env` and set up SMTP and other required variables.
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

---

## License
This project is published under ISC license.