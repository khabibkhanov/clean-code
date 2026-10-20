import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourse, getSources, listCourseSlugs } from "@/lib/content/loader";
import { CourseMap } from "@/components/course-map";

export const dynamicParams = false;

export function generateStaticParams() {
  return listCourseSlugs().map((course) => ({ course }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[course]">): Promise<Metadata> {
  const { course } = await params;
  const c = getCourse(course);
  return { title: c.title, description: c.description };
}

export default async function CoursePage({ params }: PageProps<"/[course]">) {
  const { course: slug } = await params;
  if (!listCourseSlugs().includes(slug)) notFound();
  const course = getCourse(slug);
  const sources = Object.entries(getSources(slug));

  const modules = course.modules.map((m) => ({
    n: m.n,
    title: m.title,
    lessons: m.lessons.map(({ n, slug, title }) => ({ n, slug, title })),
  }));

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{course.title}</h1>
      <p className="mt-2 text-lg text-muted">{course.subtitle}</p>
      <p className="mt-6 max-w-[68ch] leading-relaxed">{course.description}</p>

      <CourseMap course={slug} modules={modules} />

      <section className="mt-20 max-w-[68ch]" aria-labelledby="sources-heading">
        <h2 id="sources-heading" className="text-2xl font-semibold">
          Manbalar
        </h2>
        <p className="mt-2 text-muted">
          Darslardagi barcha asosiy da&apos;volar shu manbalarga tayanadi. Har bir dars oxirida
          aniq bob yoki bo&apos;lim ko&apos;rsatilgan.
        </p>
        <ul className="mt-6 space-y-3">
          {sources.map(([id, s]) => (
            <li key={id} className="leading-snug">
              <a
                href={s.url}
                className="underline decoration-rule underline-offset-4 hover:decoration-accent"
                rel="noreferrer"
                target="_blank"
              >
                {s.title}
              </a>
              <span className="text-muted">
                {" "}
                - {s.author}, {s.year}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
