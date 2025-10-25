import { GoogleGenAI, type FunctionDeclaration } from "@google/genai";
import type { CommentModel } from "../../features/comment/comment.model.js";
import { randomInArray } from "../utils/randomInArray.js";
import { marked } from "marked";
import { SanitizePostOrCommentMiddlewareBuilder } from "../middlewares/sanitizePostOrComment.middleware.js";
import type { name } from "@adminjs/express";

/** SLOPGEN */
export class AiAnswerService {
  private static instance: AiAnswerService | null = null;
  private token = process.env.GEMINI_API_KEY || "";
  private aiUserId = 0;
  private aiClient: GoogleGenAI;
  private commentModel: CommentModel;
  private maxOutputTokens = Number(process.env.GEMINI_MAX_OUTPUT_TOKENS) || 500;

  private refuseAnswerAIFunction: FunctionDeclaration = {
    name: "refuseAnswer",
    description:
      "Use this when you don't know the answer or think the question violates policies"
  };

  private emptyAnswerTemplates = [
    "Seeesh, I ain't got no answer for that one.",
    "Hmm, that's a tough nut to crack. No answer here.",
    "I'm drawing a blank on that question, sorry!",
    "Alas, I have no wisdom to share on that topic.",
    "That question stumps me—I have no answer.",
    "Even tho i am AI, I don't have an answer for that one.",
    "My circuits are confused—I can't answer that.",
    "No insights to offer on that question, I'm afraid.",
    "That one has me stumped—no answer available.",
    "I'm fresh out of answers for that query."
  ];

  private constructor(commentModel: typeof CommentModel) {
    this.aiClient = new GoogleGenAI({
      apiKey: this.token
    });
    this.commentModel = commentModel.getInstance();

    this.aiUserId = Number(process.env.GEMINI_USER_ID) || 0;
  }

  public static getInstance(
    commentModel: typeof CommentModel
  ): AiAnswerService {
    if (!this.instance) {
      this.instance = new AiAnswerService(commentModel);
    }

    return this.instance;
  }

  private async getAiAnswer(question: string) {
    const response = await this.aiClient.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: question,
      config: {
        maxOutputTokens: this.maxOutputTokens,
        systemInstruction: `U're an AI assistant that helps ppl on sorta IT forum.
        U answer q's by providing clear, concise, and relevant info.
        May be cringy / humorous, depends on question.
        Only markdown formatted answers.
        `,
        tools: [
          {
            functionDeclarations: [this.refuseAnswerAIFunction]
          }
        ]
      }
    });

    return response;
  }

  public async postAiAnswer(postId: number, question: string) {
    const aiAnswers = await this.getAiAnswer(question);
    let answer = "";
    const isAiAnswered =
      aiAnswers?.candidates &&
      aiAnswers.candidates.length > 0 &&
      aiAnswers.functionCalls?.at(0)?.name !== this.refuseAnswerAIFunction.name;

    if (isAiAnswered) {
      answer = await marked
        .parse(aiAnswers.text || "", { async: true })
        .catch((e) => "");
    }

    if (!answer || answer.trim().length === 0) {
      answer = randomInArray(this.emptyAnswerTemplates) || "bruh";
    }

    answer = SanitizePostOrCommentMiddlewareBuilder.sanitizer(answer);

    return await this.commentModel.createComment(
      postId,
      this.aiUserId,
      null,
      answer
    );
  }
}
