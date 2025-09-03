export const QUERIES = Object.freeze({
  USER: {
    /**login, password_hash, password_salt, email, role */
    CREATE:
      "INSERT INTO user (login, password_hash, password_salt, email, role) VALUES (?, ?, ?, ?, ?)",
    /**login, password_hash, password_salt, email */
    REGISTER:
      "INSERT INTO user (login, password_hash, password_salt, email) VALUES (?, ?, ?, ?)",
    GET_USER_BY_ID: "SELECT * FROM user WHERE id = ?",
    GET_USERS: "SELECT * FROM user LIMIT ? OFFSET ((? - 1) * ?)",
    FIND_BY_EMAIL: "SELECT * FROM user WHERE email = ? LIMIT 1",
    FIND_BY_LOGIN: "SELECT * FROM user WHERE login = ? LIMIT 1",
    /** password_hash, password_salt, id */
    RESET_PASSWORD:
      "UPDATE user SET password_hash = ?, password_salt = ? WHERE id = ?",
    DELETE: "DELETE FROM user WHERE id = ?"
  },
  CATEGORY: {
    CREATE: "INSERT INTO category (name, description) VALUES (?, ?)",
    READ: "SELECT * FROM category WHERE id = ?",
    UPDATE: "UPDATE category SET name = ?, description = ? WHERE id = ?",
    DELETE: "DELETE FROM category WHERE id = ?"
  },
  COMMENT: {
    CREATE:
      "INSERT INTO comment (post_id, user_id, parent_id, content) VALUES (?, ?, ?, ?)",
    READ: "SELECT * FROM comment WHERE post_id = ?",
    UPDATE: "UPDATE comment SET content = ? WHERE id = ?",
    DELETE: "DELETE FROM comment WHERE id = ?"
  },
  LIKE: {
    CREATE:
      "INSERT INTO like_dislike (user_id, post_id, comment_id, is_like) VALUES (?, ?, ?, ?)",
    READ: "SELECT * FROM like_dislike WHERE user_id = ?",
    UPDATE:
      "UPDATE like_dislike SET is_like = ? WHERE user_id = ? AND post_id = ? AND comment_id = ?",
    DELETE:
      "DELETE FROM like_dislike WHERE user_id = ? AND post_id = ? AND comment_id = ?"
  },
  REFRESH_TOKEN: {
    CREATE:
      "INSERT INTO refresh_token (user_id, token, expires_at) VALUES (?, ?, ?)",
    READ: "SELECT * FROM refresh_token WHERE user_id = ?",
    UPDATE:
      "UPDATE refresh_token SET token = ?, expires_at = ? WHERE user_id = ?",
    DELETE: "DELETE FROM refresh_token WHERE token = ?"
  }
});
