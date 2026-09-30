import type { QuizQuestion } from "@/features/courses/types";

type QuizQuestionsProps = {
  title: string;
  questions: QuizQuestion[];
};

export function QuizQuestions({ title, questions }: QuizQuestionsProps) {
  const totalPoints = questions.reduce((sum, question) => sum + question.points, 0);

  return (
    <div className="rounded-lg border border-violet-200 bg-violet-50/40 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-violet-900">{title}</p>
        <p className="text-xs text-violet-700">
          {questions.length} questions · {totalPoints} points
        </p>
      </div>

      {questions.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">This quiz has no questions yet.</p>
      ) : (
        <ol className="mt-3 space-y-3">
          {questions.map((question, index) => (
            <li key={question._id} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-slate-900">
                  {index + 1}. {question.question}
                </p>
                <span className="shrink-0 text-xs text-slate-500">
                  {question.points} {question.points === 1 ? "pt" : "pts"}
                </span>
              </div>
              <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {question.choices.map((choice) => {
                  const isCorrect = choice === question.correctAnswer;
                  return (
                    <li
                      key={choice}
                      className={`rounded-md border px-2.5 py-1.5 text-sm ${
                        isCorrect
                          ? "border-emerald-300 bg-emerald-50 font-medium text-emerald-800"
                          : "border-slate-200 text-slate-700"
                      }`}
                    >
                      {isCorrect ? "✓ " : ""}
                      {choice}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
