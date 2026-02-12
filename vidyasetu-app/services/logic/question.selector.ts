import questionFile from "@/services/assets/questions.json";
import { AptitudeQuestion, QuestionsFile } from "../../types";

const bank = questionFile as QuestionsFile;

export function select10Questions(): AptitudeQuestion[] {
  const questions = bank.questions;

  const easy = questions.filter((q) => q.meta.difficulty === "easy");
  const medium = questions.filter((q) => q.meta.difficulty === "medium");
  const hard = questions.filter((q) => q.meta.difficulty === "hard");

  const pick = (arr: AptitudeQuestion[], n: number) =>
    [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

  return [...pick(easy, 3), ...pick(medium, 4), ...pick(hard, 3)];
}
