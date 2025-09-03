CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    login VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100) NOT NULL UNIQUE,
    avatar VARCHAR(255),
    rating INT DEFAULT 0,
    role ENUM('user', 'donator', 'moderator', 'admin') DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    banned_until DATETIME,
    ban_reason VARCHAR(255)
);
CREATE INDEX idx_login ON user (login);
CREATE INDEX idx_email ON user (email);
CREATE INDEX idx_rating ON user (rating);

CREATE TABLE refresh_token (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,

    FOREIGN KEY (user_id) REFERENCES user(id)
);
CREATE INDEX idx_user_id ON refresh_token (user_id);

CREATE TABLE post (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL, -- author
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status ENUM('active', 'locked') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,

    FOREIGN KEY (user_id) REFERENCES user(id)
);
CREATE INDEX idx_post_user_id ON post (user_id);
CREATE INDEX idx_post_status ON post (status);
CREATE INDEX idx_post_created_at ON post (created_at);


CREATE TABLE category (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE INDEX idx_category_title ON category (title);

CREATE TABLE post_categories (
    post_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (post_id, category_id),

    FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
);
CREATE INDEX idx_post_categories_post_id ON post_categories (post_id);
CREATE INDEX idx_post_categories_category_id ON post_categories (category_id);


CREATE TABLE comment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    parent_id INT DEFAULT NULL, -- nested comment
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,

    FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comment(id) ON DELETE CASCADE
);
CREATE INDEX idx_comment_post_id ON comment (post_id);
CREATE INDEX idx_comment_user_id ON comment (user_id);

CREATE TABLE like_dislike (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL, -- author
    post_id INT DEFAULT NULL,
    comment_id INT DEFAULT NULL,
    is_like BOOLEAN NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comment(id) ON DELETE CASCADE,
    CHECK (post_id IS NOT NULL OR comment_id IS NOT NULL),
    CHECK (NOT (post_id IS NOT NULL AND comment_id IS NOT NULL))
);
CREATE INDEX idx_like_dislike_user_id ON like_dislike (user_id);
CREATE INDEX idx_like_dislike_post_id ON like_dislike (post_id);
CREATE INDEX idx_like_dislike_comment_id ON like_dislike (comment_id);

DELIMITER $$


CREATE TRIGGER after_like_dislike_insert
AFTER INSERT ON like_dislike
FOR EACH ROW
BEGIN
    DECLARE target_user_id INT;
    IF NEW.post_id IS NOT NULL THEN
        SELECT user_id INTO target_user_id FROM post WHERE id = NEW.post_id;
    ELSEIF NEW.comment_id IS NOT NULL THEN
        SELECT user_id INTO target_user_id FROM comment WHERE id = NEW.comment_id;
    END IF;
    IF NEW.is_like THEN
        UPDATE user
        SET rating = rating + 1
        WHERE id = target_user_id;
    ELSE
        UPDATE user
        SET rating = rating - 1
        WHERE id = target_user_id;
    END IF;
END$$

CREATE TRIGGER after_like_dislike_update
AFTER UPDATE ON like_dislike
FOR EACH ROW
BEGIN
    DECLARE target_user_id INT;
    IF OLD.post_id IS NOT NULL THEN
        SELECT user_id INTO target_user_id FROM post WHERE id = OLD.post_id;
    ELSEIF OLD.comment_id IS NOT NULL THEN
        SELECT user_id INTO target_user_id FROM comment WHERE id = OLD.comment_id;
    END IF;
    IF OLD.is_like != NEW.is_like THEN
        IF OLD.is_like THEN
            UPDATE user SET rating = rating - 1 WHERE id = target_user_id;
        ELSE
            UPDATE user SET rating = rating + 1 WHERE id = target_user_id;
        END IF;

        IF NEW.is_like THEN
            UPDATE user SET rating = rating + 1 WHERE id = target_user_id;
        ELSE
            UPDATE user SET rating = rating - 1 WHERE id = target_user_id;
        END IF;
    END IF;
END$$

DELIMITER ;