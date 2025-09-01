import express from "express";

const categoryRouter = express.Router();

categoryRouter.get("/", (req, res) => {
  res.json({ message: "All categories" });
});

categoryRouter.get("/:category_id", (req, res) => {
  const { category_id } = req.params;
  res.json({ message: `Category ${category_id}` });
});

categoryRouter.get("/:category_id/posts", (req, res) => {
  const { category_id } = req.params;
  res.json({ message: `Posts for category ${category_id}` });
});

categoryRouter.post("/", (req, res) => {
  const { title } = req.body;
  res.json({ message: `Category created`, title });
});

categoryRouter.patch("/:category_id", (req, res) => {
  const { category_id } = req.params;
  const { title } = req.body;
  res.json({ message: `Category ${category_id} updated`, title });
});

categoryRouter.delete("/:category_id", (req, res) => {
  const { category_id } = req.params;
  res.json({ message: `Category ${category_id} deleted` });
});

export { categoryRouter };
