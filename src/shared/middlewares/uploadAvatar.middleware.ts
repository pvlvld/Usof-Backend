import multer from "multer";
import { InternalServerError } from "../consts/errors.js";
import path from "node:path";
import sharp from "sharp";
import type { Request } from "express";
import fs from "node:fs";

type ImageMimeType = `image/${keyof sharp.FormatEnum}`;
const allowedMimeTypes: ImageMimeType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
];
const donatorOnlyMimeTypes: ImageMimeType[] = ["image/gif"];

class MulterAvatarStorage implements multer.StorageEngine {
  private imageOptions: {
    width: number;
    fileFormat: keyof sharp.FormatEnum;
    quality: number;
  } = {
    width: 512,
    fileFormat: "webp",
    quality: 85
  };
  private avatarDir = path.join(process.cwd(), "public", "uploads", "avatars");

  constructor() {
    fs.mkdirSync(this.avatarDir, { recursive: true });
  }
  _removeFile(
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null) => void
  ): void {
    fs.unlink(file.path, callback);
  }

  _handleFile(
    req: Request,
    file: Express.Multer.File,
    callback: (
      error?: Error | null,
      info?: Partial<Express.Multer.File>
    ) => void
  ): void {
    const filename = this.getFilename(req);
    const outPath = path.join(this.avatarDir, filename);

    const transform = sharp({ pages: -1 })
      .resize(this.imageOptions.width, this.imageOptions.width, {
        fit: "cover"
      })
      .toFormat(this.imageOptions.fileFormat, {
        quality: this.imageOptions.quality
      })
      .toFile(outPath, (err, info) => {
        if (err) {
          console.error("Error processing image:", err);
          return callback(
            new InternalServerError("Error processing the avatar.")
          );
        }
        callback(null, {
          path: outPath
        });
      });

    file.stream.pipe(transform);

    transform.on("error", (err) => {
      console.error("Sharp transformation error:", err);
      callback(new InternalServerError("Error processing the avatar."));
    });
  }

  /** avatar_userId.webp */
  private getFilename(req: Request) {
    return `avatar_${req.user?.id}.${this.imageOptions.fileFormat}`;
  }
}

function fileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (!allowedMimeTypes.includes(file.mimetype as ImageMimeType)) {
    cb(
      new InternalServerError(
        "Invalid file type. Only JPEG, PNG, GIF and WEBP are allowed."
      )
    );
  }

  const isDonatorOrAdmin =
    req.user?.role === "donator" || req.user?.role === "admin";
  if (
    !isDonatorOrAdmin &&
    donatorOnlyMimeTypes.includes(file.mimetype as ImageMimeType)
  ) {
    return cb(
      new InternalServerError(
        "Only donators can upload GIF avatars. Please upgrade your account."
      )
    );
  }

  cb(null, true);
}

const uploadAvatar = multer({
  dest: "public/uploads/avatars/",
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter,
  storage: new MulterAvatarStorage()
});

export { uploadAvatar };
