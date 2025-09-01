import express from "express";

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

postRouter.get("/", (req, res) => {
  res.send("List of all posts. Page 1");
});

postRouter.get("/:post_id", (req, res) => {
  res.send(`Post with id ${req.params.post_id}`);
});

postRouter.get("/:post_id/comments", (req, res) => {
  res.send(`All comments for post ${req.params.post_id}`);
});

postRouter.post("/:post_id/comments", (req, res) => {
  const { content } = req.body;
  res.send(
    `Created comment for post ${req.params.post_id} with content: ${content}`
  );
});

postRouter.get("/:post_id/categories", (req, res) => {
  res.send(`All categories for post ${req.params.post_id}`);
});

postRouter.get("/:post_id/like", (req, res) => {
  res.send(`All likes for post ${req.params.post_id}`);
});

postRouter.post("/", (req, res) => {
  const { title, content, categories } = req.body;
  res.send(
    `Created new post with title: ${title}, content: ${content}, categories: ${categories}`
  );
});

postRouter.post("/:post_id/like", (req, res) => {
  res.send(`Liked post ${req.params.post_id}`);
});

// POST CREATOR ONLY
postRouter.patch("/:post_id", (req, res) => {
  res.send(`Updated post ${req.params.post_id}`);
});

postRouter.delete("/:post_id", (req, res) => {
  res.send(`Deleted post ${req.params.post_id}`);
});

postRouter.delete("/:post_id/like", (req, res) => {
  res.send(`Deleted like for post ${req.params.post_id}`);
});

// Act: Creative

postRouter.get("/favorites", (req, res) => {
  res.send("List of favorite posts");
});

postRouter.post("/:post_id/subscribe", (req, res) => {
  res.send(`Subscribed to post ${req.params.post_id}`);
});

export { postRouter };
