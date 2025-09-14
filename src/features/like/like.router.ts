import express, {
  type NextFunction,
  type Request,
  type Response
} from "express";

const likeRouter = express.Router({ mergeParams: true });

likeRouter.post(
  "/:id/like",
  (req: Request, res: Response, next: NextFunction) => {
    // Like | Dislike | Unset (Null?)
    const { id } = req.params;
    const { action } = req.body;

    let targetType = "";
    if (req.baseUrl.includes("/posts")) {
      targetType = "post";
    } else if (req.baseUrl.includes("/comments")) {
      targetType = "comment";
    } else {
      res.status(400).send({
        message: "Like action must be associated with a post or comment"
      });
      return;
    }

    if (action === "like") {
      //
    } else if (action === "dislike") {
      //
    } else if (action === "unset") {
      //
    }

    res.status(200).send({ message: `Success!` });
  }
);

export { likeRouter };
