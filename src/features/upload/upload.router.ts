import express, {
  type NextFunction,
  type Request,
  type Response
} from "express";
import { uploadController } from "./upload.controller.js";
import { authenticateMiddleware } from "../../shared/middlewares/auth.middleware.js";
import { uploadPostImageMiddleware } from "../../shared/middlewares/uploadImage.middleware.js";

const uploadRouter = express.Router();

/**
 * POST /api/uploads/image
 * Upload an image for use in posts (e.g., with TinyMCE)
 * Requires authentication
 * Returns the image URL
 */
uploadRouter.post(
  "/image",
  authenticateMiddleware,
  uploadPostImageMiddleware.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    uploadController.uploadImage(req, res, next);
  }
);

export { uploadRouter };
