"use client";

import Link from "next/link";
import { useState } from "react";
import type { QuizItem } from "@/lib/content/schema";
import { markLessonCompleted, useCompletedLessons } from "@/lib/progress";

type TaskView = {
  title: string;
  checklist: string[];
  promptHtml: string;
  starterHtml: string;
  solutionHtml: string;
  solutionNotesHtml: string;
};

type NextLesson = { slug: string; n: number; title: string } | null;

type Props = {
  course: string;
  lessonN: number;
  quiz: QuizItem[];
  task: TaskView;
  next: NextLesson;
};

export function LessonExercises({ course, lessonN, quiz, task, next }: Props) {
  const completed = useCompletedLessons(course).includes(lessonN);
  const [quizPassed, setQuizPassed] = useState(false);
  const [checked, setChecked] = useState<boolean[]>(() => task.checklist.map(() => false));

  const checklistDone = checked.every(Boolean);
  const canComplete = quizPassed && checklistDone;

  return (
    <section id="mashqlar" className="mt-20 scroll-mt-6">
      <h2 className="text-2xl font-semibold">Mashqlar</h2>
      <p className="mt-2 text-muted">
        Keyingi dars ochilishi uchun barcha savollarga to&apos;g&apos;ri javob bering va amaliy
        topshiriqni bajaring.
      </p>

      <Quiz quiz={quiz} solved={completed} onPassed={() => setQuizPassed(true)} />

      <div className="mt-14">
        <h3 className="text-xl font-semibold">Amaliy topshiriq: {task.title}</h3>
        <div className="lesson-body mt-4" dangerouslySetInnerHTML={{ __html: task.promptHtml }} />
        <p className="mt-6 text-sm text-muted">Boshlang&apos;ich kod</p>
        <div className="mt-2" dangerouslySetInnerHTML={{ __html: task.starterHtml }} />

        <fieldset className="mt-8">
          <legend className="font-semibold">O&apos;zingizni tekshiring</legend>
          <ul className="mt-3 space-y-2">
            {task.checklist.map((item, i) => (
              <li key={item}>
                <label className="flex cursor-pointer gap-3 leading-snug">
                  <input
                    type="checkbox"
                    className="mt-1 size-4 shrink-0 accent-[var(--accent)]"
                    checked={completed || checked[i]}
                    disabled={completed}
                    onChange={(e) =>
                      setChecked((prev) => prev.map((v, j) => (j === i ? e.target.checked : v)))
                    }
                  />
                  <span>{item}</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        <details className="group mt-8 rounded-lg border border-rule bg-sheet">
          <summary className="cursor-pointer select-none px-4 py-3 font-medium">
            Namunaviy yechim
            <span className="ml-2 text-sm font-normal text-muted">
              (avval o&apos;zingiz bajaring)
            </span>
          </summary>
          <div className="border-t border-rule px-4 pb-4">
            <div className="mt-4" dangerouslySetInnerHTML={{ __html: task.solutionHtml }} />
            <div className="lesson-body mt-4" dangerouslySetInnerHTML={{ __html: task.solutionNotesHtml }} />
          </div>
        </details>
      </div>

      <div className="mt-14 rounded-lg border border-rule bg-sheet p-5">
        {completed ? (
          <div>
            <p className="font-semibold text-good">Dars tugatildi.</p>
            {next ? (
              <Link
                href={`/${course}/${next.slug}`}
                className="mt-4 inline-block rounded-md bg-accent px-4 py-2 font-medium text-white hover:opacity-90 dark:text-paper"
              >
                Keyingi dars: {next.n}. {next.title}
              </Link>
            ) : (
              <p className="mt-2">Bu kursning oxirgi darsi edi.</p>
            )}
          </div>
        ) : (
          <div>
            <ul className="space-y-1 text-sm">
              <li className={quizPassed ? "text-good" : "text-muted"}>
                {quizPassed ? "✓" : "○"} Test savollari
              </li>
              <li className={checklistDone ? "text-good" : "text-muted"}>
                {checklistDone ? "✓" : "○"} Amaliy topshiriq ro&apos;yxati
              </li>
            </ul>
            <button
              type="button"
              disabled={!canComplete}
              onClick={() => markLessonCompleted(course, lessonN)}
              className="mt-4 rounded-md bg-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:bg-rule disabled:text-muted dark:text-paper"
            >
              Darsni yakunlash
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function Quiz({
  quiz,
  solved,
  onPassed,
}: {
  quiz: QuizItem[];
  solved: boolean;
  onPassed: () => void;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => quiz.map(() => null));
  const [checkedOnce, setCheckedOnce] = useState(false);

  const allAnswered = answers.every((a) => a !== null);
  const isCorrect = (i: number) => answers[i] === quiz[i].answer;
  const correctCount = answers.filter((_, i) => isCorrect(i)).length;
  const passed = checkedOnce && correctCount === quiz.length;

  function check() {
    setCheckedOnce(true);
    if (answers.every((a, i) => a === quiz[i].answer)) onPassed();
  }

  function retryWrong() {
    setAnswers((prev) => prev.map((a, i) => (a === quiz[i].answer ? a : null)));
    setCheckedOnce(false);
  }

  return (
    <div className="mt-10">
      <h3 className="text-xl font-semibold">Test</h3>
      <ol className="mt-6 space-y-10">
        {quiz.map((item, i) => {
          const locked = checkedOnce && isCorrect(i);
          return (
            <li key={item.q}>
              <fieldset>
                <legend className="font-medium leading-snug">
                  <span className="text-muted tabular-nums">{i + 1}. </span>
                  {item.q}
                </legend>
                <div className="mt-3 space-y-2">
                  {item.options.map((option, j) => {
                    const selected = answers[i] === j;
                    const showResult = checkedOnce && selected;
                    const tone = !showResult
                      ? selected
                        ? "border-accent bg-accent-soft"
                        : "border-rule hover:border-muted"
                      : j === item.answer
                        ? "border-good bg-good-soft"
                        : "border-bad bg-bad-soft";
                    return (
                      <label
                        key={option}
                        className={`flex cursor-pointer gap-3 rounded-md border px-3 py-2 leading-snug ${tone}`}
                      >
                        <input
                          type="radio"
                          name={`q-${i}`}
                          className="mt-1 shrink-0 accent-[var(--accent)]"
                          checked={selected}
                          disabled={solved || locked || checkedOnce}
                          onChange={() =>
                            setAnswers((prev) => prev.map((a, k) => (k === i ? j : a)))
                          }
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
                {checkedOnce && answers[i] !== null && (
                  <p className={`mt-3 text-sm leading-relaxed ${isCorrect(i) ? "text-good" : "text-bad"}`}>
                    <strong>{isCorrect(i) ? "To'g'ri." : "Noto'g'ri."}</strong>{" "}
                    {isCorrect(i) && <span className="text-ink">{item.explain}</span>}
                    {!isCorrect(i) && <span className="text-ink">Yana o&apos;ylab ko&apos;ring.</span>}
                  </p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>

      {!solved && (
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {!checkedOnce ? (
            <button
              type="button"
              disabled={!allAnswered}
              onClick={check}
              className="rounded-md border border-ink px-4 py-2 font-medium hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:border-rule disabled:text-muted disabled:hover:bg-transparent"
            >
              Javoblarni tekshirish
            </button>
          ) : passed ? (
            <p className="font-medium text-good">
              Hammasi to&apos;g&apos;ri: {correctCount} / {quiz.length}
            </p>
          ) : (
            <>
              <p className="text-muted">
                {correctCount} / {quiz.length} to&apos;g&apos;ri
              </p>
              <button
                type="button"
                onClick={retryWrong}
                className="rounded-md border border-ink px-4 py-2 font-medium hover:bg-ink hover:text-paper"
              >
                Noto&apos;g&apos;rilarini qayta yechish
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
