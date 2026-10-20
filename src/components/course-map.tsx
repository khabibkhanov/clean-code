"use client";

import Link from "next/link";
import { currentLessonNumber, useCompletedLessons } from "@/lib/progress";

type MapLesson = { n: number; slug: string; title: string };
type MapModule = { n: number; title: string; lessons: MapLesson[] };

type LessonState = "done" | "current" | "upcoming";

function stateOf(n: number, completed: readonly number[], current: number): LessonState {
  if (completed.includes(n)) return "done";
  return n === current ? "current" : "upcoming";
}

const CELL_STYLE: Record<LessonState, string> = {
  done: "bg-ink text-paper border-ink",
  current: "border-accent text-accent border-2 font-semibold",
  upcoming: "border-rule text-muted hover:border-muted",
};

const STATE_LABEL: Record<LessonState, string> = {
  done: "tugatilgan",
  current: "navbatdagi",
  upcoming: "",
};

export function CourseMap({ course, modules }: { course: string; modules: MapModule[] }) {
  const completed = useCompletedLessons(course);
  const all = modules.flatMap((m) => m.lessons);
  const current = currentLessonNumber(completed, all.length);
  const currentLesson = all.find((l) => l.n === current);
  const finished = completed.length === all.length;

  return (
    <>
      <section className="mt-12" aria-label="Kurs xaritasi">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <p className="text-muted">
            <span className="text-2xl font-semibold text-ink tabular-nums">{completed.length}</span>
            <span className="tabular-nums"> / {all.length}</span> dars tugatildi
          </p>
          {currentLesson && (
            <Link
              href={`/${course}/${currentLesson.slug}`}
              className="rounded-md bg-accent px-4 py-2 font-medium text-white hover:opacity-90 dark:text-paper"
            >
              {finished
                ? "Kursni qayta ko'rish"
                : completed.length === 0
                  ? "Kursni boshlash"
                  : `${current}-darsni davom ettirish`}
            </Link>
          )}
        </div>

        <ol className="mt-6 space-y-2">
          {modules.map((m) => (
            <li key={m.n} className="grid gap-2 sm:grid-cols-[16rem_1fr] sm:items-center">
              <a href={`#modul-${m.n}`} className="text-sm text-muted hover:text-ink">
                {m.n}. {m.title}
              </a>
              <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
                {m.lessons.map((l) => {
                  const state = stateOf(l.n, completed, current);
                  return (
                    <Link
                      key={l.n}
                      href={`/${course}/${l.slug}`}
                      title={`${l.n}. ${l.title}`}
                      aria-label={`${l.n}-dars: ${l.title}${STATE_LABEL[state] ? `, ${STATE_LABEL[state]}` : ""}`}
                      className={`flex aspect-square items-center justify-center rounded border text-xs tabular-nums transition-colors sm:text-sm ${CELL_STYLE[state]}`}
                    >
                      {l.n}
                    </Link>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-20" aria-label="Darslar ro'yxati">
        <div className="grid gap-x-12 gap-y-12 md:grid-cols-2">
          {modules.map((m) => (
            <div key={m.n} id={`modul-${m.n}`} className="scroll-mt-6">
              <h2 className="text-xl font-semibold">
                <span className="text-muted tabular-nums">{m.n}. </span>
                {m.title}
              </h2>
              <ol className="mt-4 border-t border-rule">
                {m.lessons.map((l) => {
                  const state = stateOf(l.n, completed, current);
                  return (
                    <li key={l.n} className="border-b border-rule">
                      <Link
                        href={`/${course}/${l.slug}`}
                        className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-2 py-2.5"
                      >
                        <span className="text-sm text-muted tabular-nums">{l.n}</span>
                        <span className="group-hover:text-accent">{l.title}</span>
                        <span
                          className={
                            state === "done"
                              ? "text-sm text-good"
                              : state === "current"
                                ? "text-sm text-accent"
                                : "text-sm"
                          }
                        >
                          {state === "done" ? "✓" : STATE_LABEL[state]}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
