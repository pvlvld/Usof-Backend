import express from "express";

const categoriesRouter = express.Router();

categoriesRouter.get("/", (req, res) => {
  res.json({ message: "All categories" });
});

categoriesRouter.get("/:category_id", (req, res) => {
  const { category_id } = req.params;
  res.json({ message: `Category ${category_id}` });
});

categoriesRouter.get("/:category_id/posts", (req, res) => {
  const { category_id } = req.params;
  res.json({ message: `Posts for category ${category_id}` });
});

categoriesRouter.post("/", (req, res) => {
  const { title } = req.body;
  res.json({ message: `Category created`, title });
});

categoriesRouter.patch("/:category_id", (req, res) => {
  const { category_id } = req.params;
  const { title } = req.body;
  res.json({ message: `Category ${category_id} updated`, title });
});

categoriesRouter.delete("/:category_id", (req, res) => {
  const { category_id } = req.params;
  res.json({ message: `Category ${category_id} deleted` });
});

export { categoriesRouter };
