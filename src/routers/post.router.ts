import express, {
  type NextFunction,
  type Request,
  type Response
} from "express";

const postRouter = express.Router();

//TODO:
// - post locking / unlocking
// - post sorting
// - - Default: by likes count
// - - by date
// - post filtering
// - - by category
// - - by date interval
// - - by status (locked?)

postRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("List of all posts. Page 1");
});

postRouter.get(
  "/:post_id",
  (req: Request, res: Response, next: NextFunction) => {
    res.send(`Post with id ${req.params.post_id}`);
  }
);

postRouter.get(
  "/:post_id/comments",
  (req: Request, res: Response, next: NextFunction) => {
    res.send(`All comments for post ${req.params.post_id}`);
  }
);

postRouter.post(
  "/:post_id/comments",
  (req: Request, res: Response, next: NextFunction) => {
    const { content } = req.body;
    res.send(
      `Created comment for post ${req.params.post_id} with content: ${content}`
    );
  }
);

postRouter.get(
  "/:post_id/categories",
  (req: Request, res: Response, next: NextFunction) => {
    res.send(`All categories for post ${req.params.post_id}`);
  }
);

postRouter.get(
  "/:post_id/like",
  (req: Request, res: Response, next: NextFunction) => {
    res.send(`All likes for post ${req.params.post_id}`);
  }
);

postRouter.post("/", (req: Request, res: Response, next: NextFunction) => {
  const { title, content, categories } = req.body;
  res.send(
    `Created new post with title: ${title}, content: ${content}, categories: ${categories}`
  );
});

postRouter.post(
  "/:post_id/like",
  (req: Request, res: Response, next: NextFunction) => {
    res.send(`Liked post ${req.params.post_id}`);
  }
);

// POST CREATOR ONLY
postRouter.patch(
  "/:post_id",
  (req: Request, res: Response, next: NextFunction) => {
    res.send(`Updated post ${req.params.post_id}`);
  }
);

postRouter.delete(
  "/:post_id",
  (req: Request, res: Response, next: NextFunction) => {
    res.send(`Deleted post ${req.params.post_id}`);
  }
);

postRouter.delete(
  "/:post_id/like",
  (req: Request, res: Response, next: NextFunction) => {
    res.send(`Deleted like for post ${req.params.post_id}`);
  }
);

// Act: Creative

postRouter.get(
  "/favorites",
  (req: Request, res: Response, next: NextFunction) => {
    res.send("List of favorite posts");
  }
);

postRouter.post(
  "/:post_id/subscribe",
  (req: Request, res: Response, next: NextFunction) => {
    res.send(`Subscribed to post ${req.params.post_id}`);
  }
);

export { postRouter };
