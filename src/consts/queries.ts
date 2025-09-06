export const QUERIES = Object.freeze({
  USER: {
    /**login, password_hash, password_salt, email, role */
    CREATE:
      "INSERT INTO user (login, password_hash, password_salt, email, role) VALUES (?, ?, ?, ?, ?)",
    /**login, password_hash, password_salt, email */
    REGISTER:
      "INSERT INTO user (login, password_hash, password_salt, email) VALUES (?, ?, ?, ?)",
    GET_BY_ID: "SELECT * FROM user WHERE id = ?",
    GET_PAGINATED: "SELECT * FROM user LIMIT ? OFFSET ?",
    /**login, email, password_hash, password_salt, full_name, avatar, rating, role, id */
    UPDATE: `UPDATE user SET login = ?, email = ?, password_hash = ?, password_salt = ?, full_name = ?, avatar = ?, rating = ?, role = ? WHERE id = ?`,
    FIND_BY_EMAIL: "SELECT * FROM user WHERE email = ? LIMIT 1",
    FIND_BY_LOGIN: "SELECT * FROM user WHERE login = ? LIMIT 1",
    /** password_hash, password_salt, id */
    RESET_PASSWORD:
      "UPDATE user SET password_hash = ?, password_salt = ? WHERE id = ?",
    DELETE: "DELETE FROM user WHERE id = ?",
    BAN: "UPDATE user SET banned_until = ?, ban_reason = ? WHERE id = ?",
    UNBAN:
      "UPDATE user SET banned_until = NULL, ban_reason = NULL WHERE id = ?",
    VERIFY_EMAIL: "UPDATE user SET is_email_verified = TRUE WHERE id = ?"
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
  },
  PASSWORD_RESETS: {
    /** user_id, token (64), expires_at */
    CREATE:
      "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)",
    GET_BY_TOKEN: "SELECT * FROM password_resets WHERE token = ?",
    GET_BY_USER_ID: "SELECT * FROM password_resets WHERE user_id = ?",
    UPDATE:
      "UPDATE password_resets SET token = ?, expires_at = ? WHERE user_id = ?",
    DELETE: "DELETE FROM password_resets WHERE token = ?",
    /** expires_at <*/
    DELETE_EXPIRED: "DELETE FROM password_resets WHERE expires_at < ?"
  },
  EMAIL_VERIFICATIONS: {
    CREATE: "INSERT INTO email_verifications (user_id, token) VALUES (?, ?)",
    GET_BY_TOKEN: "SELECT * FROM email_verifications WHERE token = ?",
    GET_BY_USER_ID: "SELECT * FROM email_verifications WHERE user_id = ?",
    DELETE: "DELETE FROM email_verifications WHERE token = ?"
  }
});
