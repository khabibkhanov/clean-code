import { z } from "zod";

export const sourceSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  year: z.number().int(),
  kind: z.enum(["book", "paper", "article", "web", "docs", "spec", "talk"]),
  url: z.url(),
});
export type Source = z.infer<typeof sourceSchema>;
export const sourcesFileSchema = z.record(z.string(), sourceSchema);

export const syllabusLessonSchema = z.object({
  n: z.number().int().positive(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  sources: z.array(z.string()).min(1),
});
export type SyllabusLesson = z.infer<typeof syllabusLessonSchema>;

export const moduleSchema = z.object({
  n: z.number().int().positive(),
  title: z.string().min(1),
  lessons: z.array(syllabusLessonSchema).min(1),
});
export type CourseModule = z.infer<typeof moduleSchema>;

export const courseSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  description: z.string().min(1),
  modules: z.array(moduleSchema).min(1),
});
export type Course = z.infer<typeof courseSchema>;

export const quizItemSchema = z
  .object({
    q: z.string().min(1),
    options: z.array(z.string().min(1)).min(3).max(5),
    answer: z.number().int().nonnegative(),
    explain: z.string().min(1),
  })
  .refine((item) => item.answer < item.options.length, {
    message: "answer index is out of range",
  });
export type QuizItem = z.infer<typeof quizItemSchema>;

export const taskSchema = z.object({
  title: z.string().min(1),
  prompt: z.string().min(1),
  lang: z.string().min(1),
  starter: z.string().min(1),
  solution: z.string().min(1),
  solutionNotes: z.string().min(1),
  checklist: z.array(z.string().min(1)).min(3),
});
export type Task = z.infer<typeof taskSchema>;

export const lessonFrontmatterSchema = z.object({
  n: z.number().int().positive(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  duration: z.number().int().positive(),
  sources: z
    .array(z.object({ id: z.string().min(1), note: z.string().min(1) }))
    .min(1),
  quiz: z.array(quizItemSchema).min(5),
  task: taskSchema,
});
export type LessonFrontmatter = z.infer<typeof lessonFrontmatterSchema>;

export const REQUIRED_SECTIONS = [
  "Muammo",
  "Asosiy g'oya",
  "Chuqurroq",
  "Misol",
  "Qachon qo'llamaslik kerak",
  "Xulosa",
] as const;
