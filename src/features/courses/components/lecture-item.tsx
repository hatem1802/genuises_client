import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLectureDetails } from "@/features/courses/api";
import { QuizQuestions } from "@/features/courses/components/quiz-questions";
import type { CourseStructure } from "@/features/courses/types";

type LectureItemProps = {
  courseId: string;
  order: number;
  lecture: CourseStructure["lectures"][number];
};

const VIDEO_PATTERN = /\/video\/upload\/|\.(mp4|webm|ogg|mov)(\?|$)/i;
const IMAGE_PATTERN = /\/image\/upload\/|\.(jpe?g|png|gif|webp)(\?|$)/i;

export function LectureItem({ courseId, order, lecture }: LectureItemProps) {
  const [open, setOpen] = useState(false);

  const detailsQuery = useQuery({
    queryKey: ["courses", "lecture", courseId, lecture._id],
    queryFn: () => fetchLectureDetails(courseId, lecture._id),
    enabled: open,
  });

  const details = detailsQuery.data?.lecture;
  const quizzesCount = lecture.quizzes.length;

  return (
    <li className="rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
            {order}
          </span>
          <span className="truncate font-medium text-slate-900">{lecture.title}</span>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-xs text-slate-500">
          <span>
            {quizzesCount} {quizzesCount === 1 ? "quiz" : "quizzes"}
          </span>
          <span aria-hidden>{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open ? (
        <div className="space-y-4 border-t border-slate-100 px-4 py-4">
          {detailsQuery.isPending ? (
            <p className="text-sm text-slate-500">Loading lecture…</p>
          ) : detailsQuery.isError ? (
            <p className="text-sm text-red-700">{detailsQuery.error.message}</p>
          ) : details ? (
            <>
              {details.lectureLink ? (
                <div className="space-y-2">
                  {VIDEO_PATTERN.test(details.lectureLink) ? (
                    <video
                      src={details.lectureLink}
                      controls
                      preload="metadata"
                      className="w-full max-w-2xl rounded-lg bg-black"
                    />
                  ) : IMAGE_PATTERN.test(details.lectureLink) ? (
                    <img
                      src={details.lectureLink}
                      alt={details.title}
                      className="max-h-80 rounded-lg border border-slate-200 object-contain"
                    />
                  ) : null}
                  <a
                    href={details.lectureLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex break-all text-sm font-medium text-sky-700 hover:underline"
                  >
                    Open lecture content ↗
                  </a>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No content uploaded for this lecture yet.</p>
              )}

              {details.quizzes.map((quiz) => (
                <QuizQuestions key={quiz._id} title={quiz.title} questions={quiz.questions} />
              ))}
            </>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
