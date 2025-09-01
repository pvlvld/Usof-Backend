import express from "express";

const commentRouter = express.Router();

commentRouter.get("/:comment_id", (req, res) => {
  const { comment_id } = req.params;
  res.json({ message: `Comment ${comment_id}` });
});

commentRouter.get("/:comment_id/like", (req, res) => {
  const { comment_id } = req.params;
  res.json({ message: `Likes for comment ${comment_id}` });
});

commentRouter.post("/:comment_id/like", (req, res) => {
  const { comment_id } = req.params;
  res.json({ message: `Like added to comment ${comment_id}` });
});

commentRouter.patch("/:comment_id", (req, res) => {
  const { comment_id } = req.params;
  // Extract updated comment data from request body
  res.json({ message: `Comment ${comment_id} updated` });
});

commentRouter.delete("/:comment_id", (req, res) => {
  const { comment_id } = req.params;
  res.json({ message: `Comment ${comment_id} deleted` });
});

commentRouter.delete("/:comment_id/like", (req, res) => {
  const { comment_id } = req.params;
  res.json({ message: `Like removed from comment ${comment_id}` });
});

export { commentRouter };
