import multer from "multer";
import { InternalServerError } from "../consts/errors.js";
import path from "node:path";

const uploadAvatar = multer({
  dest: "public/uploads/avatars/",
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new InternalServerError(
          "Invalid file type. Only JPEG, PNG and WEBP are allowed."
        )
      );
    }
  },
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/uploads/avatars/");
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      // Use avatar_ prefix to allow future avatar frames or other decorations
      const filename = `avatar_${req.user?.id}${ext}`;
      cb(null, filename);
    }
  })
});

export { uploadAvatar };
