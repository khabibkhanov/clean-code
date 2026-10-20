import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import YAML from "yaml";
import {
  courseSchema,
  lessonFrontmatterSchema,
  sourcesFileSchema,
  type Course,
  type LessonFrontmatter,
  type Source,
  type SyllabusLesson,
} from "./schema";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type Lesson = LessonFrontmatter & {
  body: string;
  moduleN: number;
  moduleTitle: string;
};

export function lessonFileName(lesson: Pick<SyllabusLesson, "n" | "slug">) {
  return `${String(lesson.n).padStart(3, "0")}-${lesson.slug}.md`;
}

function readYaml(file: string): unknown {
  return YAML.parse(fs.readFileSync(file, "utf8"));
}

export function listCourseSlugs(): string[] {
  return fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .filter((d) => fs.existsSync(path.join(CONTENT_DIR, d.name, "course.yaml")))
    .map((d) => d.name)
    .sort();
}

export function getCourse(courseSlug: string): Course {
  return courseSchema.parse(
    readYaml(path.join(CONTENT_DIR, courseSlug, "course.yaml")),
  );
}

export function getSources(courseSlug: string): Record<string, Source> {
  return sourcesFileSchema.parse(
    readYaml(path.join(CONTENT_DIR, courseSlug, "sources.yaml")),
  );
}

export function flattenSyllabus(course: Course) {
  return course.modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleN: m.n, moduleTitle: m.title })),
  );
}

export function lessonPath(courseSlug: string, lesson: SyllabusLesson) {
  return path.join(CONTENT_DIR, courseSlug, "lessons", lessonFileName(lesson));
}

export function getLesson(courseSlug: string, slug: string): Lesson | null {
  const entry = flattenSyllabus(getCourse(courseSlug)).find(
    (l) => l.slug === slug,
  );
  if (!entry) return null;
  const file = lessonPath(courseSlug, entry);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  return {
    ...lessonFrontmatterSchema.parse(data),
    body: content,
    moduleN: entry.moduleN,
    moduleTitle: entry.moduleTitle,
  };
}

export function isLessonWritten(courseSlug: string, lesson: SyllabusLesson) {
  return fs.existsSync(lessonPath(courseSlug, lesson));
}
