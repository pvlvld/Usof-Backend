export const QUERIES = Object.freeze({
  USER: {
    /**login, password_hash, password_salt, email, role */
    CREATE:
      "INSERT INTO user (login, password_hash, password_salt, email, role) VALUES (?, ?, ?, ?, ?)",
    /**login, password_hash, password_salt, email */
    REGISTER:
      "INSERT INTO user (login, password_hash, password_salt, email) VALUES (?, ?, ?, ?)",
    /** id */
    GET_BY_ID: "SELECT * FROM user WHERE id = ?",
    /** order_by, order_direction (ASC | DESC), limit, offset */
    GET_PAGINATED: (
      order_by: string,
      order_direction: "ASC" | "DESC",
      limit: number,
      offset: number
    ) =>
      `SELECT * FROM user WHERE deleted_at IS NULL ORDER BY ${order_by} ${order_direction} LIMIT ${limit} OFFSET ${offset}`,
    /**login, password_hash, password_salt, full_name, email, email_verified, avatar, rating, role, created_at, updated_at, banned_until, ban_reason, deleted_at, id */
    UPDATE: `UPDATE user SET login = ?, password_hash = ?, password_salt = ?, full_name = ?, email = ?, email_verified = ?, avatar = ?, rating = ?, role = ?, created_at = ?, updated_at = ?, banned_until = ?, ban_reason = ?, deleted_at = ? WHERE id = ?`,
    /** email */
    FIND_BY_EMAIL: "SELECT * FROM user WHERE email = ? LIMIT 1",
    /** login */
    FIND_BY_LOGIN: "SELECT * FROM user WHERE login = ? LIMIT 1",
    /** password_hash, password_salt, id */
    RESET_PASSWORD:
      "UPDATE user SET password_hash = ?, password_salt = ? WHERE id = ?",
    /** id */
    DELETE:
      "UPDATE user SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL",
    /** banned_until, ban_reason, id */
    BAN: "UPDATE user SET banned_until = ?, ban_reason = ? WHERE id = ?",
    /** id */
    UNBAN:
      "UPDATE user SET banned_until = NULL, ban_reason = NULL WHERE id = ?",
    /** id */
    VERIFY_EMAIL: "UPDATE user SET email_verified = TRUE WHERE id = ?"
  },
  CATEGORY: {
    /** title, description */
    CREATE: "INSERT INTO category (title, description) VALUES (?, ?)",
    /** id */
    READ: "SELECT * FROM category WHERE id = ?",
    GET_ALL: "SELECT * FROM category",
    /** title, description, id */
    UPDATE: "UPDATE category SET title = ?, description = ? WHERE id = ?",
    /** id */
    DELETE: "DELETE FROM category WHERE id = ?",
    /** post_id */
    GET_POST_CATEGORIES: `
      SELECT
        c.id,
        c.title,
        c.description
      FROM post_categories pc
      JOIN category c ON pc.category_id = c.id
      WHERE pc.post_id = ?
    `
  },
  COMMENT: {
    /** post_id, user_id, parent_id, content */
    CREATE:
      "INSERT INTO comment (post_id, user_id, parent_id, content) VALUES (?, ?, ?, ?)",
    /** comment_id */
    READ: "SELECT * FROM comment WHERE id = ?",
    /** post_id */
    READ_POST_COMMENTS: "SELECT * FROM comment WHERE post_id = ?",
    /** user_id */
    READ_USER_COMMENTS: "SELECT * FROM comment WHERE user_id = ?",
    /** parent_id */
    READ_PARENT_COMMENTS: "SELECT * FROM comment WHERE parent_id = ?",
    /** content, id */
    UPDATE: "UPDATE comment SET content = ? WHERE id = ?",
    /** id */
    DELETE:
      "UPDATE comment SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL",
    /** id */
    ACTIVATE: "UPDATE comment SET status = 'active' WHERE id = ?",
    /** id */
    INACTIVATE: "UPDATE comment SET status = 'inactive' WHERE id = ?"
  },
  LIKE: {
    /** user_id, post_id, comment_id, is_like */
    CREATE:
      "INSERT INTO like_dislike (user_id, post_id, comment_id, is_like) VALUES (?, ?, ?, ?)",
    /** user_id, post_id, comment_id */
    READ: "SELECT * FROM like_dislike WHERE user_id = ? AND post_id = ? AND comment_id = ?",
    /** post_id */
    READ_POST_LIKES: "SELECT * FROM like_dislike WHERE post_id = ?",
    /** comment_id */
    READ_COMMENT_LIKES: "SELECT * FROM like_dislike WHERE comment_id = ?",
    /** is_like, user_id, post_id, comment_id */
    UPDATE:
      "UPDATE like_dislike SET is_like = ? WHERE user_id = ? AND post_id = ? AND comment_id = ?",
    /** user_id, post_id */
    DELETE_POST_LIKE:
      "DELETE FROM like_dislike WHERE user_id = ? AND post_id = ?",
    /** user_id, comment_id */
    DELETE_COMMENT_LIKE:
      "DELETE FROM like_dislike WHERE user_id = ? AND comment_id = ?",
    /** user_id, post_id, comment_id, is_like */
    UPSERT: `
      INSERT INTO like_dislike (user_id, post_id, comment_id, is_like)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE is_like = VALUES(is_like)
    `
  },
  REFRESH_TOKEN: {
    /** user_id, token, ip, user_agent, expires_at */
    CREATE:
      "INSERT INTO refresh_token (user_id, token, ip, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)",
    /** user_id */
    READ: "SELECT * FROM refresh_token WHERE user_id = ?",
    /** token, ip, user_agent, expires_at, user_id */
    UPDATE:
      "UPDATE refresh_token SET token = ?, ip = ?, user_agent = ?, expires_at = ? WHERE user_id = ?",
    /** token */
    DELETE: "DELETE FROM refresh_token WHERE token = ?"
  },
  PASSWORD_RESETS: {
    /** user_id, token (64), expires_at */
    CREATE:
      "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)",
    /** token */
    GET_BY_TOKEN: "SELECT * FROM password_resets WHERE token = ?",
    /** user_id */
    GET_BY_USER_ID: "SELECT * FROM password_resets WHERE user_id = ?",
    /** token, expires_at, user_id */
    UPDATE:
      "UPDATE password_resets SET token = ?, expires_at = ? WHERE user_id = ?",
    /** token */
    DELETE: "DELETE FROM password_resets WHERE token = ?",
    /** expires_at <*/
    DELETE_EXPIRED: "DELETE FROM password_resets WHERE expires_at < ?"
  },
  EMAIL_VERIFICATIONS: {
    /** user_id, token (64) */
    CREATE: "INSERT INTO email_verifications (user_id, token) VALUES (?, ?)",
    /** token */
    GET_BY_TOKEN: "SELECT * FROM email_verifications WHERE token = ?",
    /** user_id */
    GET_BY_USER_ID: "SELECT * FROM email_verifications WHERE user_id = ?",
    /** token */
    DELETE: "DELETE FROM email_verifications WHERE token = ?"
  },
  POST: {
    /** user_id, title, content */
    CREATE: "INSERT INTO post (user_id, title, content) VALUES (?, ?, ?)",
    /** id */
    READ: `
      SELECT
        p.*,
        JSON_ARRAYAGG(JSON_OBJECT('id', c.id, 'title', c.title)) AS categories
      FROM post p
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN category c ON pc.category_id = c.id
      WHERE p.id = ?
      GROUP BY p.id;
    `,
    /**
     * Generates a paginated post query with dynamic filters for status, user, categories, sorting, and pagination.
     */
    GET_PAGINATED: (
      sort: string,
      order: "ASC" | "DESC",
      limit: number,
      offset: number,
      status: "active" | "inactive" | "all",
      userId: number | undefined,
      categories: string[] | undefined,
      from_date?: string,
      to_date?: string
    ) => {
      let whereClauses = ["p.deleted_at IS NULL"];
      if (status !== "all") {
        whereClauses.push("p.status = ?");
      }
      let joinClause = "";
      if (userId && userId > 0) {
        whereClauses.push("p.user_id = ?");
      }
      if (categories && categories.length > 0) {
        joinClause = "JOIN post_categories pc ON p.id = pc.post_id";
        whereClauses.push(
          `pc.category_id IN (${categories.map(() => "?").join(",")})`
        );
      }
      if (from_date) {
        whereClauses.push("p.created_at >= ?");
      }
      if (to_date) {
        whereClauses.push("p.created_at <= ?");
      }
      const where = whereClauses.length
        ? `WHERE ${whereClauses.join(" AND ")}`
        : "";
      return `SELECT p.* FROM post p ${joinClause} ${where} ORDER BY ${sort} ${order} LIMIT ${limit} OFFSET ${offset}`;
    },
    /** title, content, status, id */
    UPDATE: "UPDATE post SET title = ?, content = ?, status = ? WHERE id = ?",
    /** id */
    DELETE:
      "UPDATE post SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL",
    /** user_id */
    GET_BY_USER_ID:
      "SELECT * FROM post WHERE user_id = ? AND deleted_at IS NULL ORDER BY created_at DESC",
    /** category_id */
    GET_BY_CATEGORY_ID: `SELECT p.* FROM post p JOIN post_categories pc ON p.id = pc.post_id WHERE pc.category_id = ? AND p.deleted_at IS NULL ORDER BY p.created_at DESC`,
    /** post_id, category_id */
    ADD_CATEGORY:
      "INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)",
    /** [[post_id, category_id], ...] */
    ADD_CATEGORIES:
      "INSERT INTO post_categories (post_id, category_id) VALUES ?",
    /** post_id, category_id */
    REMOVE_CATEGORY:
      "DELETE FROM post_categories WHERE post_id = ? AND category_id = ?",
    /** post_id */
    REMOVE_ALL_CATEGORIES: "DELETE FROM post_categories WHERE post_id = ?",
    /** id */
    ACTIVATE: "UPDATE post SET status = 'active' WHERE id = ?",
    /** id */
    INACTIVATE: "UPDATE post SET status = 'inactive' WHERE id = ?"
  }
});
