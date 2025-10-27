import multer from "multer";
import { InternalServerError } from "../consts/errors.js";
import path from "node:path";
import sharp from "sharp";
import type { Request } from "express";
import fs from "node:fs";
import type { IImageMimeType, ISharpImageOptions } from "../types.js";

type IGetFilenameCallback = (req: Request, file: Express.Multer.File) => string;

interface IImageUploadOptions {
  imageFilePrefix?: string;
  imageDir?: string | (() => string);
  imageOptions?: ISharpImageOptions;
  allowedMimeTypes?: IImageMimeType[];
  donatorOnlyMimeTypes?: IImageMimeType[];
  fileSizeLimitMB?: number;
  getFilenameCb?: IGetFilenameCallback;
}

class ImageUploadBuilder {
  private _imageDir: NonNullable<IImageUploadOptions["imageDir"]>;
  private imageOptions: ISharpImageOptions;
  private allowedMimeTypes: IImageMimeType[];
  private donatorOnlyMimeTypes: IImageMimeType[];
  private fileSizeLimitMB: number;
  private getFilename: IGetFilenameCallback;
  constructor(options: IImageUploadOptions = {}) {
    this._imageDir =
      options.imageDir ||
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

    this.getFilename =
      options.getFilenameCb ||
      ((req, file) => {
        const timestamp = process.hrtime.bigint().toString();
        const prefix = options.imageFilePrefix || "img";
        return `${prefix}_${timestamp}`;
      });
    // Required to ensure 'this' context is correct in fileFilter
    this.fileFilter = this.fileFilter.bind(this);
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

  private imageDir(): string {
    const path =
      typeof this._imageDir === "function" ? this._imageDir() : this._imageDir;

    fs.mkdirSync(path, { recursive: true });
    return path;
  }

  private storage: multer.StorageEngine = {
    _handleFile: (req, file, callback) => {
      const filename = `${this.getFilename(req, file)}.${
        this.imageOptions.fileFormat
      }`;
      const outPath = path.join(this.imageDir(), filename);

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
            return callback(new InternalServerError("Error processing image."));
          }
          callback(null, {
            path: outPath
          });
        });

      file.stream.pipe(transform);

      transform.on("error", (err) => {
        console.error("Sharp transformation error:", err);
        callback(new InternalServerError("Error processing image."));
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
      limits: { fileSize: this.fileSizeLimitMB * 1024 * 1024, files: 1 },
      fileFilter: this.fileFilter,
      storage: this.storage
    });
  }
}

const uploadAvatarMiddleware = new ImageUploadBuilder({
  imageDir: path.join(process.cwd(), "public", "uploads", "avatars"),
  imageFilePrefix: "avatar_",
  imageOptions: {
    width: 32,
    fileFormat: "webp",
    quality: 75
  },

  getFilenameCb: (req) => `avatar_${req.user?.id}`
}).build();

const uploadPostImageMiddleware = new ImageUploadBuilder({
  imageDir: () => {
    // Date based subdirectory (e.g., "2024/06" - "year/month")
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    return path.join(process.cwd(), "public", "uploads", "posts", year, month);
  },
  imageFilePrefix: "post_",
  imageOptions: {
    width: 1080,
    fileFormat: "webp",
    quality: 85
  },
  fileSizeLimitMB: 13,
  getFilenameCb: (req, file) => {
    const timestamp = process.hrtime.bigint().toString();
    const safeOriginalName = file.originalname
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");
    return `post_${timestamp}_${safeOriginalName}`;
  }
}).build();

export {
  ImageUploadBuilder,
  uploadAvatarMiddleware,
  uploadPostImageMiddleware
};
