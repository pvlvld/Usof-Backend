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
        req.body.content = this.sanitizer(req.body.content);
      }
      return next();
    };
  }

  sanitizer(content: string) {
    return this.domPurify.sanitize(content, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "b",
        "em",
        "i",
        "u",
        "a",
        "ul",
        "ol",
        "li",
        "blockquote",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "img",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
        "span"
      ],
      ALLOWED_ATTR: [
        "href",
        "target",
        "rel",
        "src",
        "alt",
        "title",
        "width",
        "height",
        "style",
        "align",
        "colspan",
        "rowspan"
      ]
    });
  }
}

const sanitizePostOrCommentMiddlewareBuilder =
  new SanitizePostOrCommentMiddlewareBuilder();

export const sanitizePostOrComment =
  sanitizePostOrCommentMiddlewareBuilder.getMiddleware();
