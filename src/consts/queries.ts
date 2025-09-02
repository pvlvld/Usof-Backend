export const QUERIES = Object.freeze({
  USER: {
    /**login, password_hash, password_salt, email, role */
    CREATE:
      "INSERT INTO user (login, password_hash, password_salt, email, role) VALUES ($1, $2, $3, $4, $5)",
    /**login, password_hash, password_salt, email */
    REGISTER:
      "INSERT INTO user (login, password_hash, password_salt, email) VALUES ($1, $2, $3, $4)",
    READ: "SELECT * FROM user WHERE id = $1",
    FIND_BY_EMAIL: "SELECT * FROM user WHERE email = ? LIMIT 1",
    FIND_BY_LOGIN: "SELECT * FROM user WHERE login = ? LIMIT 1",
    RESET_PASSWORD: "UPDATE user SET password = $1 WHERE email = $2",
    UPDATE:
      "UPDATE user SET login = $1, email = $2, password = $3 WHERE id = $4",
    DELETE: "DELETE FROM user WHERE id = $1"
  },
  CATEGORY: {
    CREATE: "INSERT INTO category (name, description) VALUES ($1, $2)",
    READ: "SELECT * FROM category WHERE id = $1",
    UPDATE: "UPDATE category SET name = $1, description = $2 WHERE id = $3",
    DELETE: "DELETE FROM category WHERE id = $1"
  },
  COMMENT: {
    CREATE:
      "INSERT INTO comment (post_id, user_id, parent_id, content) VALUES ($1, $2, $3, $4)",
    READ: "SELECT * FROM comment WHERE post_id = $1",
    UPDATE: "UPDATE comment SET content = $1 WHERE id = $2",
    DELETE: "DELETE FROM comment WHERE id = $1"
  },
  LIKE: {
    CREATE:
      "INSERT INTO like_dislike (user_id, post_id, comment_id, is_like) VALUES ($1, $2, $3, $4)",
    READ: "SELECT * FROM like_dislike WHERE user_id = $1",
    UPDATE:
      "UPDATE like_dislike SET is_like = $1 WHERE user_id = $2 AND post_id = $3 AND comment_id = $4",
    DELETE:
      "DELETE FROM like_dislike WHERE user_id = $1 AND post_id = $2 AND comment_id = $3"
  },
  REFRESH_TOKEN: {
    CREATE:
      "INSERT INTO refresh_token (user_id, token, expires_at) VALUES ($1, $2, $3)",
    READ: "SELECT * FROM refresh_token WHERE user_id = $1",
    UPDATE:
      "UPDATE refresh_token SET token = $1, expires_at = $2 WHERE user_id = $3",
    DELETE: "DELETE FROM refresh_token WHERE token = $1"
  }
});
