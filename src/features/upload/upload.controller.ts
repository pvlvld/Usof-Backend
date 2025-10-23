import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../../shared/consts/errors.js";
import path from "node:path";

class UploadController {
  /**
   * Handles image upload for TinyMCE posts
   * Expects multipart/form-data with 'file' field
   * Returns the relative path to the uploaded image
   */
  public async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return next(new UnauthorizedError());
      }

      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded"
        });
      }

      // Get the relative path from the public directory
      const filePath = path.relative(
        path.join(process.cwd(), "public"),
        req.file.path
      );

      // Return the URL path that can be used in img src
      const imageUrl = `/uploads/${filePath.replace(/\\/g, "/")}`;

      return res.status(200).json({
        url: imageUrl,
        filename: req.file.filename
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const uploadController = new UploadController();
