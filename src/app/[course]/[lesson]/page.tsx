import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  flattenSyllabus,
  getCourse,
  getLesson,
  getSources,
  listCourseSlugs,
} from "@/lib/content/loader";
import { codeToMarkdown, extractToc, markdownToHtml } from "@/lib/content/markdown";
import { LessonExercises } from "@/components/lesson-exercises";

export const dynamicParams = false;

export function generateStaticParams() {
  return listCourseSlugs().flatMap((course) =>
    flattenSyllabus(getCourse(course)).map((l) => ({ course, lesson: l.slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[course]/[lesson]">): Promise<Metadata> {
  const { course, lesson } = await params;
  const entry = flattenSyllabus(getCourse(course)).find((l) => l.slug === lesson);
  return { title: entry ? `${entry.n}. ${entry.title}` : "Dars" };
}

export default async function LessonPage({ params }: PageProps<"/[course]/[lesson]">) {
  const { course: courseSlug, lesson: lessonSlug } = await params;
  const course = getCourse(courseSlug);
  const syllabus = flattenSyllabus(course);
  const index = syllabus.findIndex((l) => l.slug === lessonSlug);
  if (index === -1) notFound();

  const entry = syllabus[index];
  const prev = syllabus[index - 1];
  const next = syllabus[index + 1];
  const lesson = getLesson(courseSlug, lessonSlug);

  if (!lesson) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-muted">{entry.n}-dars</p>
        <h1 className="mt-2 text-3xl font-semibold">{entry.title}</h1>
        <p className="mt-6">Bu dars hali yozilmagan.</p>
        <Link href={`/${courseSlug}`} className="mt-6 inline-block text-accent underline">
          Kurs xaritasiga qaytish
        </Link>
      </main>
    );
  }

  const sources = getSources(courseSlug);
  const bodyHtml = await markdownToHtml(lesson.body);
  const toc = extractToc(bodyHtml);
  const task = lesson.task;
  const [promptHtml, starterHtml, solutionHtml, solutionNotesHtml] = await Promise.all([
    markdownToHtml(task.prompt),
    markdownToHtml(codeToMarkdown(task.starter, task.lang)),
    markdownToHtml(codeToMarkdown(task.solution, task.lang)),
    markdownToHtml(task.solutionNotes),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-14">
      <aside className="hidden lg:block">
        <nav aria-label="Dars mundarijasi" className="sticky top-6 text-sm">
          <Link href={`/${courseSlug}`} className="text-muted hover:text-ink">
            {course.title}: kurs xaritasi
          </Link>
          <ol className="mt-6 space-y-2 border-l border-rule">
            {toc.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="-ml-px block border-l border-transparent pl-3 text-muted hover:border-ink hover:text-ink">
                  {item.text}
                </a>
              </li>
            ))}
            <li>
              <a href="#mashqlar" className="-ml-px block border-l border-transparent pl-3 text-muted hover:border-ink hover:text-ink">
                Mashqlar
              </a>
            </li>
            <li>
              <a href="#manbalar" className="-ml-px block border-l border-transparent pl-3 text-muted hover:border-ink hover:text-ink">
                Manbalar
              </a>
            </li>
          </ol>
        </nav>
      </aside>

      <article className="max-w-[70ch]">
        <Link href={`/${courseSlug}`} className="text-sm text-muted hover:text-ink lg:hidden">
          {course.title}: kurs xaritasi
        </Link>
        <header className="mt-2 lg:mt-0">
          <div className="flex items-end gap-5">
            <span className="text-7xl font-semibold leading-none tracking-tighter text-accent tabular-nums sm:text-8xl">
              {lesson.n}
            </span>
            <span className="pb-1.5 text-sm leading-snug text-muted">
              {lesson.moduleN}-modul
              <br />
              {lesson.moduleTitle}
            </span>
          </div>
          <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {lesson.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">{lesson.summary}</p>
          <p className="mt-3 text-sm text-muted">Taxminan {lesson.duration} daqiqa</p>
        </header>

        <div className="lesson-body mt-4" dangerouslySetInnerHTML={{ __html: bodyHtml }} />

        <LessonExercises
          course={courseSlug}
          lessonN={lesson.n}
          quiz={lesson.quiz}
          task={{
            title: task.title,
            checklist: task.checklist,
            promptHtml,
            starterHtml,
            solutionHtml,
            solutionNotesHtml,
          }}
          next={next ? { slug: next.slug, n: next.n, title: next.title } : null}
        />

        <section id="manbalar" className="mt-16 scroll-mt-6 border-t border-rule pt-8">
          <h2 className="text-xl font-semibold">Manbalar</h2>
          <ul className="mt-4 space-y-3">
            {lesson.sources.map((s) => {
              const src = sources[s.id];
              return (
                <li key={s.id} className="leading-snug">
                  <a href={src.url} target="_blank" rel="noreferrer" className="underline decoration-rule underline-offset-4 hover:decoration-accent">
                    {src.title}
                  </a>
                  <span className="text-muted"> - {src.author}, {src.year}</span>
                  <p className="mt-1 text-sm text-muted">{s.note}</p>
                </li>
              );
            })}
          </ul>
        </section>

        <nav className="mt-12 flex justify-between gap-4 border-t border-rule pt-6 text-sm" aria-label="Darslar orasida">
          {prev ? (
            <Link href={`/${courseSlug}/${prev.slug}`} className="text-muted hover:text-ink">
              {prev.n}. {prev.title}
            </Link>
          ) : (
            <span />
          )}
          <Link href={`/${courseSlug}`} className="text-muted hover:text-ink">
            Kurs xaritasi
          </Link>
        </nav>
      </article>
    </main>
  );
}
