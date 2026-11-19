import { answerLocal, unknownAnswer, type PipAnswer } from "./knowledge";

export type PipReply = PipAnswer & { source: "page" | "fallback" };

/**
 * Answer a visitor's question from the page's own content. Runs entirely in the
 * browser: nothing is sent anywhere. If the page doesn't cover it, the visitor
 * gets Nahiyan's email and a WhatsApp link prefilled with their question.
 */
export function askPip(question: string): PipReply {
  const q = question.trim().slice(0, 400);
  const local = answerLocal(q);
  return local ? { ...local, source: "page" } : { ...unknownAnswer(q), source: "fallback" };
}
