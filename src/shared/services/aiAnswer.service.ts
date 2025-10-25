import { GoogleGenAI } from "@google/genai";
import type { CommentModel } from "../../features/comment/comment.model.js";
import { randomInArray } from "../utils/randomInArray.js";

/** SLOPGEN */
export class AiAnswerService {
  private static instance: AiAnswerService | null = null;
  private token = process.env.GEMINI_API_KEY || "";
  private aiUserId = 0;
  private aiClient: GoogleGenAI;
  private commentModel: CommentModel;

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

    this.aiUserId = Number(process.env.AI_USER_ID) || 0;
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
      model: "gemini",
      contents: question
    });

    return response;
  }

  public async postAiAnswer(postId: number, question: string) {
    const aiAnswers = await this.getAiAnswer(question);
    let answer = "";
    if (!aiAnswers?.candidates || aiAnswers.candidates.length === 0) {
      answer = randomInArray(this.emptyAnswerTemplates) || "bruh";
    } else {
      answer = aiAnswers.text || "";
    }

    return await this.commentModel.createComment(
      postId,
      this.aiUserId,
      null,
      answer
    );
  }
}
