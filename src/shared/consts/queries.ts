export const QUERIES = Object.freeze({
  USER: {
    /**login, password_hash, password_salt, email, role */
    CREATE:
      "INSERT INTO user (login, password_hash, password_salt, email, role) VALUES (?, ?, ?, ?, ?)",
    /**login, password_hash, password_salt, email */
    REGISTER:
      "INSERT INTO user (login, password_hash, password_salt, email) VALUES (?, ?, ?, ?)",
    /** id */
    GET_BY_ID: `
      SELECT
        u.*,
        (
          SELECT MAX(rt.created_at)
          FROM refresh_token rt
          WHERE rt.user_id = u.id
        ) AS last_online
      FROM user u
      WHERE u.id = ?
    `,
    /** order_by, order_direction (ASC | DESC), limit, offset */
    GET_PAGINATED: (
      order_by: string,
      order_direction: "ASC" | "DESC",
      limit: number,
      offset: number
    ) =>
      `
      SELECT
        u.*,
        (SELECT COUNT(*) FROM post p WHERE p.user_id = u.id AND p.deleted_at IS NULL) AS posts_count,
        (SELECT COUNT(*) FROM comment c WHERE c.user_id = u.id AND c.deleted_at IS NULL) AS comments_count
      FROM user u
      WHERE u.deleted_at IS NULL
      ORDER BY ${order_by} ${order_direction}
      LIMIT ${limit} OFFSET ${offset}
      `,
    /**login, password_hash, password_salt, full_name, email, email_verified, avatar, rating, role, created_at, updated_at, banned_until, ban_reason, deleted_at, id */
    UPDATE: `UPDATE user SET login = ?, password_hash = ?, password_salt = ?, full_name = ?, email = ?, email_verified = ?, avatar = ?, rating = ?, role = ?, created_at = ?, updated_at = ?, banned_until = ?, ban_reason = ?, deleted_at = ? WHERE id = ?`,
    /** email */
    FIND_BY_EMAIL: "SELECT * FROM user WHERE email = ? LIMIT 1",
    /** login */
    FIND_BY_LOGIN: "SELECT * FROM user WHERE login = ? LIMIT 1",
    /** password_hash, password_salt, user_id */
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
    READ: `
      SELECT
      c.*,
      COUNT(p.id) AS posts_count
      FROM category c
      LEFT JOIN post_categories pc ON c.id = pc.category_id
      LEFT JOIN post p ON pc.post_id = p.id AND p.deleted_at IS NULL
      WHERE c.id = ?
      GROUP BY c.id
    `,
    GET_ALL: `
      SELECT
      c.*,
      COUNT(p.id) AS posts_count
      FROM category c
      LEFT JOIN post_categories pc ON c.id = pc.category_id
      LEFT JOIN post p ON pc.post_id = p.id AND p.deleted_at IS NULL
      GROUP BY c.id
    `,
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
    `,
    /** category_id */
    GET_CATEGORY_POSTS: `
      SELECT
        p.*
      FROM post_categories pc
      JOIN post p ON pc.post_id = p.id
      WHERE pc.category_id = ? AND p.deleted_at IS NULL
      ORDER BY p.created_at DESC
    `
  },
  COMMENT: {
    /** post_id, user_id, parent_id, content */
    CREATE:
      "INSERT INTO comment (post_id, user_id, parent_id, content) VALUES (?, ?, ?, ?)",
    /** comment_id */
    READ: "SELECT * FROM comment WHERE id = ?",
    /** post_id */
    READ_POST_COMMENTS: (post_id: number, viewerId: number = 0) => {
      if (viewerId === 0) {
        return `
      SELECT
        c.*,
        u.login AS user_login,
        COALESCE(SUM(
          CASE
            WHEN ld.is_like = 1 THEN 1
            WHEN ld.is_like = 0 THEN -1
            ELSE 0
          END
        ), 0) AS rating
      FROM comment c
      JOIN user u ON c.user_id = u.id
      LEFT JOIN like_dislike ld ON ld.comment_id = c.id
      WHERE c.post_id = ${post_id}
      GROUP BY c.id
      ORDER BY rating DESC
    `;
      } else {
        return `
      SELECT
        c.*,
        u.login AS user_login,
        COALESCE(SUM(
          CASE
            WHEN ld.is_like = 1 THEN 1
            WHEN ld.is_like = 0 THEN -1
            ELSE 0
          END
        ), 0) AS rating,
        (SELECT CASE WHEN ld2.is_like = 1 THEN 'like' WHEN ld2.is_like = 0 THEN 'dislike' ELSE NULL END
           FROM like_dislike ld2
           WHERE ld2.comment_id = c.id AND ld2.user_id = ${viewerId}) AS user_reaction
      FROM comment c
      JOIN user u ON c.user_id = u.id
      LEFT JOIN like_dislike ld ON ld.comment_id = c.id
      WHERE c.post_id = ${post_id}
      GROUP BY c.id
      ORDER BY rating DESC
    `;
      }
    },
    /** user_id, limit, offset */
    READ_USER_COMMENTS: (user_id: number, limit: number, offset: number) =>
      `SELECT
         c.*,
         (
           SELECT COALESCE(SUM(
             CASE
               WHEN ld.is_like = 1 THEN 1
               WHEN ld.is_like = 0 THEN -1
               ELSE 0
             END
           ), 0)
           FROM like_dislike ld
           WHERE ld.comment_id = c.id
         ) AS rating
       FROM comment c
       WHERE c.user_id = ${user_id}
       ORDER BY c.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
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
    DELETE: "DELETE FROM refresh_token WHERE token = ?",
    /** user_id */
    DELETE_BY_USER_ID: "DELETE FROM refresh_token WHERE user_id = ?"
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
    READ: (postId: number, viewerId: number = 0) => {
      if (viewerId === 0) {
        return `
      SELECT
        p.*,
        (SELECT COUNT(*) FROM comment cm WHERE cm.post_id = p.id AND cm.deleted_at IS NULL) AS comments_count,
        JSON_ARRAYAGG(JSON_OBJECT('id', c.id, 'title', c.title)) AS categories,
        JSON_OBJECT('id', u.id, 'login', u.login, 'avatar', u.avatar) AS author
      FROM post p
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN category c ON pc.category_id = c.id
      JOIN user u ON p.user_id = u.id
      WHERE p.id = ${postId}
      GROUP BY p.id;
    `;
      } else {
        return `
      SELECT
        p.*,
        (SELECT COUNT(*) FROM comment cm WHERE cm.post_id = p.id AND cm.deleted_at IS NULL) AS comments_count,
        JSON_ARRAYAGG(JSON_OBJECT('id', c.id, 'title', c.title)) AS categories,
        JSON_OBJECT('id', u.id, 'login', u.login, 'avatar', u.avatar) AS author,
        (SELECT CASE WHEN ld.is_like = 1 THEN 'like' WHEN ld.is_like = 0 THEN 'dislike' ELSE NULL END
           FROM like_dislike ld
           WHERE ld.post_id = p.id AND ld.user_id = ${viewerId}) AS user_reaction
      FROM post p
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN category c ON pc.category_id = c.id
      JOIN user u ON p.user_id = u.id
      WHERE p.id = ${postId}
      GROUP BY p.id;
    `;
      }
    },
    /**
     * Generates a paginated post query with dynamic filters for status, user, categories, sorting, and pagination.
     * Oh God, please forgive me for this sin and have mercy on my soul.
     * Bless this code to run without SQL injection vulnerabilities and to run at all.
     */
    GET_PAGINATED: (
      sort: string,
      order: "ASC" | "DESC",
      limit: number,
      offset: number,
      status: "active" | "inactive" | "all",
      userId: number | undefined,
      categories: string[] | undefined,
      viewerId: number,
      from_date?: string,
      to_date?: string,
      searchQuery?: string
    ) => {
      let whereClauses = ["p.deleted_at IS NULL"];
      let selectClauses = ["p.*"];
      let searchScoreColumn = "";
      let joinClause = "";

      if (searchQuery) {
        whereClauses.push(
          "MATCH(p.title, p.content) AGAINST(? IN NATURAL LANGUAGE MODE)"
        );

        searchScoreColumn =
          "MATCH(p.title, p.content) AGAINST(? IN NATURAL LANGUAGE MODE) AS search_score";
        selectClauses.push(searchScoreColumn);
      }

      if (viewerId !== 0) {
        selectClauses.push(
          `(SELECT CASE WHEN ld.is_like = 1 THEN 'like' WHEN ld.is_like = 0 THEN 'dislike' ELSE NULL END
             FROM like_dislike ld
             WHERE ld.post_id = p.id AND ld.user_id = ${viewerId}) AS user_reaction`
        );
      }

      if (status !== "all") {
        whereClauses.push("p.status = ?");
      }

      if (userId && userId > 0) {
        whereClauses.push("p.user_id = ?");
      }

      if (categories && categories.length > 0) {
        joinClause = "JOIN post_categories fpc ON p.id = fpc.post_id";
        whereClauses.push(
          `fpc.category_id IN (${categories.map(() => "?").join(",")})`
        );
      }

      if (from_date) {
        whereClauses.push(`p.created_at >= '${from_date}'`);
      }

      if (to_date) {
        whereClauses.push(`p.created_at <= '${to_date}'`);
      }

      const where = whereClauses.length
        ? `WHERE ${whereClauses.join(" AND ")}`
        : "";

      const orderBy = searchQuery ? "search_score DESC, " : "";

      return `
        SELECT
          ${selectClauses.join(", ")},
          (SELECT COUNT(*) FROM comment cm WHERE cm.post_id = p.id AND cm.deleted_at IS NULL) AS comments_count,
          (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', c.id, 'title', c.title, 'description', c.description))
             FROM post_categories pc2
             JOIN category c ON pc2.category_id = c.id
             WHERE pc2.post_id = p.id
          ) AS categories,
          JSON_OBJECT('id', u.id, 'login', u.login, 'avatar', u.avatar) AS author
        FROM post p
        JOIN user u ON p.user_id = u.id
        ${joinClause}
        ${where}
        GROUP BY p.id
        ORDER BY ${orderBy} p.${sort} ${order}
        LIMIT ${limit} OFFSET ${offset}
      `.trim();
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
  },
  COLLECTION: {
    /** user_id, name, description */
    CREATE:
      "INSERT INTO collection (user_id, name, description) VALUES (?, ?, ?)",
    /** user_id */
    GET_BY_USER_ID:
      "SELECT * FROM collection WHERE user_id = ? ORDER BY created_at DESC",
    /** user_id, name */
    GET_BY_NAME: "SELECT * FROM collection WHERE user_id = ? AND name = ?",
    /** user_id, name */
    GET_WITH_POSTS: `
      SELECT 
        c.*,
        p.id as post_id,
        p.title,
        p.content,
        p.rating,
        p.created_at as post_created_at,
        cp.added_at
      FROM collection c
      LEFT JOIN collection_posts cp ON c.id = cp.collection_id
      LEFT JOIN post p ON cp.post_id = p.id AND p.deleted_at IS NULL
      WHERE c.user_id = ? AND c.name = ?
      ORDER BY cp.added_at DESC
    `,
    /** dynamic setClause, then user_id, name */
    UPDATE: (setClause: string) =>
      `UPDATE collection SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND name = ?`,
    /** user_id, name */
    DELETE: "DELETE FROM collection WHERE user_id = ? AND name = ?",
    /** post_id */
    CHECK_POST_EXISTS:
      "SELECT id FROM post WHERE id = ? AND deleted_at IS NULL",
    /** collection_id, post_id */
    ADD_POST:
      "INSERT IGNORE INTO collection_posts (collection_id, post_id) VALUES (?, ?)",
    /** collection_id, post_id */
    REMOVE_POST:
      "DELETE FROM collection_posts WHERE collection_id = ? AND post_id = ?"
  }
});
