import express, {
  type NextFunction,
  type Request,
  type Response
} from "express";
import { StatsService } from "./stats.service.js";

const statsRouter = express.Router();

statsRouter.get(
  "/users",
  async (req: Request, res: Response, next: NextFunction) => {
    res.send(await StatsService.getInstance().getUserStats());
  }
);

statsRouter.get(
  "/posts",
  async (req: Request, res: Response, next: NextFunction) => {
    res.send(await StatsService.getInstance().getPostStats());
  }
);

statsRouter.get(
  "/reactions",
  async (req: Request, res: Response, next: NextFunction) => {
    res.send(await StatsService.getInstance().getReactionStats());
  }
);

export { statsRouter };
