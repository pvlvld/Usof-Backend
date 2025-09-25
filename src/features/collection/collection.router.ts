import express, {
  type NextFunction,
  type Request,
  type Response
} from "express";
import { collectionController } from "./collection.controller.js";
import { authenticateMiddleware } from "../../shared/middlewares/auth.middleware.js";

const collectionRouter = express.Router();

// All routes require authentication
collectionRouter.use(authenticateMiddleware);

// GET /api/collections - Get user's collections
collectionRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
  collectionController.getCollections(req, res, next);
});

// POST /api/collections - Create a new collection
collectionRouter.post(
  "/",
  (req: Request, res: Response, next: NextFunction) => {
    collectionController.createCollection(req, res, next);
  }
);

// GET /api/collections/:collection_name - Get collection details
collectionRouter.get(
  "/:collection_name",
  (req: Request, res: Response, next: NextFunction) => {
    collectionController.getCollectionByName(req, res, next);
  }
);

// GET /api/collections/:collection_name/posts - Get posts in collection
collectionRouter.get(
  "/:collection_name/posts",
  (req: Request, res: Response, next: NextFunction) => {
    collectionController.getCollectionWithPosts(req, res, next);
  }
);

// PATCH /api/collections/:collection_name - Update collection
collectionRouter.patch(
  "/:collection_name",
  (req: Request, res: Response, next: NextFunction) => {
    collectionController.updateCollection(req, res, next);
  }
);

// DELETE /api/collections/:collection_name - Delete collection
collectionRouter.delete(
  "/:collection_name",
  (req: Request, res: Response, next: NextFunction) => {
    collectionController.deleteCollection(req, res, next);
  }
);

// POST /api/collections/:collection_name/posts - Add post to collection
collectionRouter.post(
  "/:collection_name/posts",
  (req: Request, res: Response, next: NextFunction) => {
    collectionController.addPostToCollection(req, res, next);
  }
);

// DELETE /collections/:collection_name/posts/:post_id - Remove post from collection
collectionRouter.delete(
  "/:collection_name/posts/:post_id",
  (req: Request, res: Response, next: NextFunction) => {
    collectionController.removePostFromCollection(req, res, next);
  }
);

export { collectionRouter };
