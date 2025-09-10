import multer from "multer";
import { InternalServerError } from "../consts/errors.js";
import path from "node:path";
import sharp from "sharp";
import type { Request } from "express";
import fs from "node:fs";

type IImageMimeType = `image/${keyof sharp.FormatEnum}`;

interface IAvatarUploadOptions {
  avatarDir?: string;
  imageOptions?: {
    width: number;
    fileFormat: keyof sharp.FormatEnum;
    quality: number;
  };
  allowedMimeTypes?: IImageMimeType[];
  donatorOnlyMimeTypes?: IImageMimeType[];
  fileSizeLimitMB?: number;
}

class AvatarUploadBuilder {
  private avatarDir: string;
  private imageOptions: {
    width: number;
    fileFormat: keyof sharp.FormatEnum;
    quality: number;
  };
  private allowedMimeTypes: IImageMimeType[];
  private donatorOnlyMimeTypes: IImageMimeType[];
  private fileSizeLimitMB: number;

  constructor(options: IAvatarUploadOptions = {}) {
    this.avatarDir =
      options.avatarDir ||
      path.join(process.cwd(), "public", "uploads", "avatars");
    this.imageOptions = options.imageOptions || {
      width: 512,
      fileFormat: "webp",
      quality: 85
    };
    this.allowedMimeTypes = options.allowedMimeTypes || [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif"
    ];
    this.donatorOnlyMimeTypes = options.donatorOnlyMimeTypes || ["image/gif"];
    this.fileSizeLimitMB = options.fileSizeLimitMB || 5;
    fs.mkdirSync(this.avatarDir, { recursive: true });

    // Required to ensure 'this' context is correct in fileFilter
    this.fileFilter = this.fileFilter.bind(this);
  }

  private getFilename(req: Request) {
    return `avatar_${req.user?.id}.${this.imageOptions.fileFormat}`;
  }

  private fileFilter(
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) {
    if (!this.allowedMimeTypes.includes(file.mimetype as IImageMimeType)) {
      return cb(
        new InternalServerError(
          "Invalid file type. Only JPEG, PNG, GIF and WEBP are allowed."
        )
      );
    }

    const isDonatorOrAdmin =
      req.user?.role === "donator" || req.user?.role === "admin";
    if (
      !isDonatorOrAdmin &&
      this.donatorOnlyMimeTypes.includes(file.mimetype as IImageMimeType)
    ) {
      return cb(
        new InternalServerError(
          "Only donators can upload GIF avatars. Please upgrade your account."
        )
      );
    }

    cb(null, true);
  }

  private storage: multer.StorageEngine = {
    _handleFile: (req, file, callback) => {
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
    },
    _removeFile: (req, file, callback) => {
      fs.promises
        .unlink(file.path)
        .then(() => callback(null))
        .catch(callback);
    }
  };

  build() {
    return multer({
      dest: this.avatarDir,
      limits: { fileSize: this.fileSizeLimitMB * 1024 * 1024, files: 1 },
      fileFilter: this.fileFilter,
      storage: this.storage
    });
  }
}

const uploadAvatar = new AvatarUploadBuilder().build();

export { uploadAvatar };
