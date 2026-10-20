import Link from "next/link";
import { flattenSyllabus, getCourse, listCourseSlugs } from "@/lib/content/loader";

export default function HomePage() {
  const courses = listCourseSlugs().map(getCourse);

  return (
    <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Kurslar</h1>
      <p className="mt-3 max-w-prose text-muted">
        Har bir kurs ketma-ket darslardan iborat. Darsni o&apos;qib, mashqlarni to&apos;g&apos;ri
        bajarganingizdan keyin keyingisi ochiladi.
      </p>
      <ul className="mt-10 divide-y divide-rule border-y border-rule">
        {courses.map((course) => (
          <li key={course.slug}>
            <Link href={`/${course.slug}`} className="group block py-6">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-xl font-semibold group-hover:text-accent">{course.title}</h2>
                <span className="shrink-0 text-sm text-muted">
                  {flattenSyllabus(course).length} dars
                </span>
              </div>
              <p className="mt-2 text-muted">{course.subtitle}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
