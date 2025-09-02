import express from "express";

const likeRouter = express.Router();

likeRouter.post("/like", (req, res) => {
  // Like | Dislike | Unset (Null?)
  res.status(200).send({ message: "Success!" });
});

export { likeRouter };
