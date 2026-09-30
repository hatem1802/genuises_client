import type {
  CourseDraft,
  LectureDraft,
  QuizDraft,
  QuizQuestionDraft,
} from "@/features/courses/types";

const makeId = () => crypto.randomUUID();

export const createQuestionDraft = (): QuizQuestionDraft => ({
  id: makeId(),
  question: "",
  choices: ["", ""],
  correctIndex: null,
  points: 1,
});

export const createQuizDraft = (title = ""): QuizDraft => ({
  id: makeId(),
  title,
  questions: [createQuestionDraft()],
});

export const createLectureDraft = (): LectureDraft => ({
  id: makeId(),
  title: "",
  source: "none",
  lectureLink: "",
  file: null,
  quizzes: [],
});

export const createCourseDraft = (): CourseDraft => ({
  title: "",
  description: "",
  instructorId: "",
  price: "",
  durationDays: "",
  certificateTemplate: "",
  lectures: [createLectureDraft()],
  fullQuiz: null,
});

function serializeQuiz(quiz: QuizDraft) {
  return {
    title: quiz.title.trim(),
    questions: quiz.questions.map((question) => {
      const choices = question.choices.map((choice) => choice.trim());
      return {
        question: question.question.trim(),
        choices,
        correctAnswer: choices[question.correctIndex ?? 0],
        points: Number(question.points),
      };
    }),
  };
}

export function buildCourseFormData(draft: CourseDraft) {
  const formData = new FormData();
  const files: File[] = [];

  const lectures = draft.lectures.map((lecture) => {
    const payload: Record<string, unknown> = {
      title: lecture.title.trim(),
      quizzes: lecture.quizzes.map(serializeQuiz),
    };

    if (lecture.source === "link") payload.lectureLink = lecture.lectureLink.trim();
    if (lecture.source === "file" && lecture.file) payload.fileIndex = files.push(lecture.file) - 1;

    return payload;
  });

  formData.append("instructorId", draft.instructorId);
  formData.append("title", draft.title.trim());
  formData.append("description", draft.description.trim());
  formData.append("price", String(Number(draft.price)));
  formData.append("durationDays", String(Number(draft.durationDays)));
  formData.append("lectures", JSON.stringify(lectures));
  if (draft.fullQuiz) formData.append("fullQuiz", JSON.stringify(serializeQuiz(draft.fullQuiz)));
  if (draft.certificateTemplate.trim()) {
    formData.append("certificateTemplate", draft.certificateTemplate.trim());
  }

  for (const file of files) formData.append("lectureFiles", file);

  return formData;
}
