import { FieldArray, useFormikContext } from "formik";
import { FieldError, FormikInput } from "@/components/ui/formik-fields";
import { createQuestionDraft } from "@/features/courses/drafts";
import type { QuizDraft } from "@/features/courses/types";

type QuizEditorProps = {
  name: string;
  label: string;
  quiz: QuizDraft;
  onRemove: () => void;
};

const smallButtonClassName =
  "rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

export function QuizEditor({ name, label, quiz, onRemove }: QuizEditorProps) {
  const { setFieldValue } = useFormikContext();

  function removeChoice(questionIndex: number, choiceIndex: number) {
    const question = quiz.questions[questionIndex];
    let correctIndex = question.correctIndex;
    if (correctIndex === choiceIndex) correctIndex = null;
    else if (correctIndex !== null && correctIndex > choiceIndex) correctIndex -= 1;

    void setFieldValue(`${name}.questions.${questionIndex}`, {
      ...question,
      choices: question.choices.filter((_, index) => index !== choiceIndex),
      correctIndex,
    });
  }

  return (
    <div className="space-y-4 rounded-lg border border-violet-200 bg-violet-50/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-violet-900">{label}</p>
        <button type="button" onClick={onRemove} className={smallButtonClassName}>
          Remove quiz
        </button>
      </div>

      <div className="space-y-1">
        <FormikInput name={`${name}.title`} placeholder="Quiz title" />
      </div>

      <FieldArray name={`${name}.questions`}>
        {(questionsHelpers) => (
          <>
            {quiz.questions.map((question, questionIndex) => {
              const questionName = `${name}.questions.${questionIndex}`;

              return (
                <div
                  key={question.id}
                  className="space-y-3 rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Question {questionIndex + 1}
                    </p>
                    <button
                      type="button"
                      disabled={quiz.questions.length === 1}
                      onClick={() => questionsHelpers.remove(questionIndex)}
                      className={smallButtonClassName}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[1fr_110px]">
                    <div className="space-y-1">
                      <FormikInput name={`${questionName}.question`} placeholder="Question text" />
                    </div>
                    <div className="space-y-1">
                      <FormikInput
                        type="number"
                        min={0}
                        name={`${questionName}.points`}
                        aria-label="Points"
                        title="Points"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-slate-500">Choices (select the correct answer)</p>
                    {question.choices.map((_, choiceIndex) => (
                      <div key={choiceIndex} className="flex items-start gap-2">
                        <input
                          type="radio"
                          name={`${questionName}.correctIndex`}
                          checked={question.correctIndex === choiceIndex}
                          onChange={() =>
                            void setFieldValue(`${questionName}.correctIndex`, choiceIndex)
                          }
                          aria-label={`Mark choice ${choiceIndex + 1} as correct`}
                          className="mt-3 h-4 w-4 accent-emerald-600"
                        />
                        <div className="flex-1 space-y-1">
                          <FormikInput
                            name={`${questionName}.choices.${choiceIndex}`}
                            placeholder={`Choice ${choiceIndex + 1}`}
                          />
                        </div>
                        <button
                          type="button"
                          disabled={question.choices.length <= 2}
                          onClick={() => removeChoice(questionIndex, choiceIndex)}
                          aria-label={`Remove choice ${choiceIndex + 1}`}
                          className={`mt-1.5 ${smallButtonClassName}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <FieldError name={`${questionName}.choices`} />
                    <FieldError name={`${questionName}.correctIndex`} />
                    <button
                      type="button"
                      onClick={() =>
                        void setFieldValue(`${questionName}.choices`, [...question.choices, ""])
                      }
                      className={smallButtonClassName}
                    >
                      + Add choice
                    </button>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => questionsHelpers.push(createQuestionDraft())}
              className={smallButtonClassName}
            >
              + Add question
            </button>
          </>
        )}
      </FieldArray>
    </div>
  );
}
