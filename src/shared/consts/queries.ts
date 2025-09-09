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
    DELETE: "UPDATE user SET deleted_at = NOW() WHERE id = ?",
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
    DELETE: "UPDATE comment SET deleted_at = NOW() WHERE id = ?"
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
    CREATE: "INSERT INTO refresh_token (user_id, token) VALUES (?, ?)",
    READ: "SELECT * FROM refresh_token WHERE user_id = ?",
    UPDATE: "UPDATE refresh_token SET token = ? WHERE user_id = ?",
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
  },
  POST: {
    /** user_id, title, content */
    CREATE: "INSERT INTO post (user_id, title, content) VALUES (?, ?, ?)",
    /** id */
    READ: "SELECT * FROM post WHERE id = ?",
    /** title, content, status, id */
    UPDATE: "UPDATE post SET title = ?, content = ?, status = ? WHERE id = ?",
    /** id */
    DELETE: "UPDATE post SET deleted_at = NOW() WHERE id = ?",
    /** limit, offset */
    GET_PAGINATED:
      "SELECT * FROM post WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT ? OFFSET ?",
    /** user_id */
    GET_BY_USER_ID:
      "SELECT * FROM post WHERE user_id = ? AND deleted_at IS NULL ORDER BY created_at DESC",
    /** category_id */
    GET_BY_CATEGORY_ID: `SELECT p.* FROM post p JOIN post_categories pc ON p.id = pc.post_id WHERE pc.category_id = ? AND p.deleted_at IS NULL ORDER BY p.created_at DESC`,
    /** post_id, category_id */
    ADD_CATEGORY:
      "INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)",
    /** post_id, category_id */
    REMOVE_CATEGORY:
      "DELETE FROM post_categories WHERE post_id = ? AND category_id = ?",
    /** id */
    ACTIVATE: "UPDATE post SET status = 'active' WHERE id = ?",
    /** id */
    LOCK: "UPDATE post SET status = 'locked' WHERE id = ?"
  }
});
