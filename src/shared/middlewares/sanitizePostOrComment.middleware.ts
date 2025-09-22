import type { NextFunction, Request, Response } from "express";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

class SanitizePostOrCommentMiddlewareBuilder {
  private domPurify: typeof DOMPurify;

  constructor() {
    const window = new JSDOM("").window;
    this.domPurify = DOMPurify(window as any);
  }

  getMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (req.body.content && typeof req.body.content === "string") {
        req.body.content = this.domPurify.sanitize(req.body.content, {
          // TODO: adjust allowed tags and attributes
          ALLOWED_TAGS: ["b", "i", "em", "strong", "a"],
          ALLOWED_ATTR: ["href", "target", "rel"]
        });
      }
      return next();
    };
  }
}

const sanitizePostOrCommentMiddlewareBuilder =
  new SanitizePostOrCommentMiddlewareBuilder();

export const sanitizePostOrComment =
  sanitizePostOrCommentMiddlewareBuilder.getMiddleware();
