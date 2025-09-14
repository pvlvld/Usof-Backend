DELIMITER //
CREATE TRIGGER after_like_dislike_insert
AFTER INSERT ON like_dislike
FOR EACH ROW
BEGIN
    DECLARE target_user_id INT;
    IF NEW.post_id IS NOT NULL THEN
        SELECT user_id INTO target_user_id FROM post WHERE id = NEW.post_id;
        IF NEW.is_like THEN
            UPDATE user
            SET rating = rating + 1
            WHERE id = target_user_id;
            UPDATE post
            SET rating = rating + 1
            WHERE id = NEW.post_id;
        ELSE
            UPDATE user
            SET rating = rating - 1
            WHERE id = target_user_id;
            UPDATE post
            SET rating = rating - 1
            WHERE id = NEW.post_id;
        END IF;
    ELSEIF NEW.comment_id IS NOT NULL THEN
        SELECT user_id INTO target_user_id FROM comment WHERE id = NEW.comment_id;
        IF NEW.is_like THEN
            UPDATE user
            SET rating = rating + 1
            WHERE id = target_user_id;
        ELSE
            UPDATE user
            SET rating = rating - 1
            WHERE id = target_user_id;
        END IF;
    END IF;
END//
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
END//
DELIMITER ;