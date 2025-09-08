import express, {
  type NextFunction,
  type Request,
  type Response
} from "express";

const categoryRouter = express.Router();

categoryRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "All categories" });
});

categoryRouter.get(
  "/:category_id",
  (req: Request, res: Response, next: NextFunction) => {
    const { category_id } = req.params;
    res.json({ message: `Category ${category_id}` });
  }
);

categoryRouter.get(
  "/:category_id/posts",
  (req: Request, res: Response, next: NextFunction) => {
    const { category_id } = req.params;
    res.json({ message: `Posts for category ${category_id}` });
  }
);

categoryRouter.post("/", (req: Request, res: Response, next: NextFunction) => {
  const { title } = req.body;
  res.json({ message: `Category created`, title });
});

categoryRouter.patch(
  "/:category_id",
  (req: Request, res: Response, next: NextFunction) => {
    const { category_id } = req.params;
    const { title } = req.body;
    res.json({ message: `Category ${category_id} updated`, title });
  }
);

categoryRouter.delete(
  "/:category_id",
  (req: Request, res: Response, next: NextFunction) => {
    const { category_id } = req.params;
    res.json({ message: `Category ${category_id} deleted` });
  }
);

export { categoryRouter };
