import { FieldArray, useFormikContext } from "formik";
import { FieldError, FormikInput } from "@/components/ui/formik-fields";
import { QuizEditor } from "@/features/courses/components/quiz-editor";
import { createQuizDraft } from "@/features/courses/drafts";
import type { LectureDraft, LectureSource } from "@/features/courses/types";

type LectureEditorProps = {
  name: string;
  index: number;
  total: number;
  lecture: LectureDraft;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
};

const SOURCE_OPTIONS: { value: LectureSource; label: string }[] = [
  { value: "none", label: "No content yet" },
  { value: "link", label: "External link" },
  { value: "file", label: "Upload file" },
];

const smallButtonClassName =
  "rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function LectureEditor({
  name,
  index,
  total,
  lecture,
  onRemove,
  onMove,
}: LectureEditorProps) {
  const { setFieldValue } = useFormikContext();

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">Lecture {index + 1}</p>
        <div className="flex gap-1.5">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            aria-label="Move lecture up"
            className={smallButtonClassName}
          >
            ↑
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => onMove(1)}
            aria-label="Move lecture down"
            className={smallButtonClassName}
          >
            ↓
          </button>
          <button type="button" onClick={onRemove} className={smallButtonClassName}>
            Remove
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <FormikInput name={`${name}.title`} placeholder="Lecture title" />
      </div>

      <div className="flex flex-wrap gap-4">
        {SOURCE_OPTIONS.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name={`${name}.source`}
              checked={lecture.source === option.value}
              onChange={() => void setFieldValue(`${name}.source`, option.value)}
              className="h-4 w-4 accent-slate-900"
            />
            {option.label}
          </label>
        ))}
      </div>

      {lecture.source === "link" ? (
        <div className="space-y-1">
          <FormikInput type="url" name={`${name}.lectureLink`} placeholder="https://…" />
        </div>
      ) : null}

      {lecture.source === "file" ? (
        <div className="space-y-1">
          <input
            type="file"
            onChange={(event) =>
              void setFieldValue(`${name}.file`, event.target.files?.[0] ?? null)
            }
            className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
          />
          <p className="text-xs text-slate-500">
            {lecture.file
              ? `${lecture.file.name} · ${formatFileSize(lecture.file.size)}`
              : "Video, audio, image, or document. Max 500 MB."}
          </p>
          <FieldError name={`${name}.file`} />
        </div>
      ) : null}

      <FieldArray name={`${name}.quizzes`}>
        {(quizzesHelpers) => (
          <>
            {lecture.quizzes.map((quiz, quizIndex) => (
              <QuizEditor
                key={quiz.id}
                name={`${name}.quizzes.${quizIndex}`}
                label={`Lecture quiz ${quizIndex + 1}`}
                quiz={quiz}
                onRemove={() => quizzesHelpers.remove(quizIndex)}
              />
            ))}

            <button
              type="button"
              onClick={() => quizzesHelpers.push(createQuizDraft())}
              className={smallButtonClassName}
            >
              + Add quiz to this lecture
            </button>
          </>
        )}
      </FieldArray>
    </div>
  );
}
