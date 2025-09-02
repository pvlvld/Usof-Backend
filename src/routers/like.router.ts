import express from "express";

const likeRouter = express.Router();

likeRouter.post("/:id/like", (req, res) => {
  // Like | Dislike | Unset (Null?)
  const { id } = req.params;
  const { action } = req.body;

  let targetType = "";
  if (req.baseUrl.includes("/posts")) {
    targetType = "post";
  } else if (req.baseUrl.includes("/comments")) {
    targetType = "comment";
  } else {
    throw new Error("Like action must be associated with a post or comment");
  }

  if (action === "like") {
    //
  } else if (action === "dislike") {
    //
  } else if (action === "unset") {
    //
  }

  res.status(200).send({ message: `Success!` });
});

export { likeRouter };
