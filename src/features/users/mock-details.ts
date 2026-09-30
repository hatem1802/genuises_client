import type {
  CourseStatus,
  InstructorCourse,
  InstructorDetails,
  StudentDetails,
  StudentSubscription,
  SubscriptionStatus,
  User,
  UserDetails,
} from "@/features/users/types";

const COURSE_TITLES = [
  "JavaScript Fundamentals",
  "Modern React with Hooks",
  "Node.js & Express APIs",
  "MongoDB for Developers",
  "TypeScript in Practice",
  "HTML & CSS from Scratch",
  "Data Structures & Algorithms",
  "Python for Beginners",
  "Git & GitHub Essentials",
  "UI/UX Design Basics",
];

const INSTRUCTOR_NAMES = ["Ahmed Hassan", "Sara Mahmoud", "Omar Khaled", "Mona Adel"];

const DAY_MS = 24 * 60 * 60 * 1000;

function createRandom(seed: string) {
  let state = 0;
  for (const char of seed) state = (state * 31 + char.charCodeAt(0)) >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Random = ReturnType<typeof createRandom>;

const randomInt = (random: Random, min: number, max: number) =>
  Math.floor(random() * (max - min + 1)) + min;

const pick = <T>(random: Random, items: T[]) => items[randomInt(random, 0, items.length - 1)];

function pickTitles(random: Random, count: number) {
  return [...COURSE_TITLES].sort(() => random() - 0.5).slice(0, count);
}

const average = (values: number[]) =>
  values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

function buildStudentDetails(random: Random, userId: string): StudentDetails {
  const subscriptions: StudentSubscription[] = pickTitles(random, randomInt(random, 1, 4)).map(
    (title, index) => {
      const durationDays = pick(random, [30, 45, 60, 90]);
      const startAt = Date.now() - randomInt(random, 5, 120) * DAY_MS;
      const endAt = startAt + durationDays * DAY_MS;
      const status: SubscriptionStatus = endAt < Date.now() ? "expired" : "active";
      const totalLectures = randomInt(random, 6, 20);
      const completedLectures = randomInt(random, 0, totalLectures);
      const percentage = Math.round((completedLectures / totalLectures) * 100);
      const quizzesCount = Math.floor(completedLectures / 3);

      return {
        _id: `${userId}-sub-${index}`,
        status,
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
        durationDays,
        course: {
          _id: `${userId}-course-${index}`,
          title,
          price: pick(random, [100, 150, 200, 250]),
          durationDays,
          lecturesCount: totalLectures,
          instructor: { _id: `instructor-${index}`, fullname: pick(random, INSTRUCTOR_NAMES) },
        },
        progress: {
          percentage,
          completedLectures,
          totalLectures,
          completedQuizzes: Array.from({ length: quizzesCount }, (_, quizIndex) => ({
            quizTitle: `Quiz ${quizIndex + 1}`,
            score: randomInt(random, 50, 100),
          })),
          certificate: { issued: percentage === 100, url: null },
        },
      };
    }
  );

  return {
    stats: {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: subscriptions.filter((item) => item.status === "active").length,
      averageProgress: average(subscriptions.map((item) => item.progress.percentage)),
      certificatesIssued: subscriptions.filter((item) => item.progress.certificate.issued).length,
    },
    subscriptions,
  };
}

function buildInstructorDetails(random: Random, userId: string): InstructorDetails {
  const courses: InstructorCourse[] = pickTitles(random, randomInt(random, 1, 5)).map(
    (title, index) => {
      const status: CourseStatus = pick(random, ["published", "published", "waiting", "draft"]);
      const studentsCount = status === "published" ? randomInt(random, 3, 60) : 0;
      const totalCodes = studentsCount + randomInt(random, 0, 20);

      return {
        _id: `${userId}-course-${index}`,
        title,
        status,
        price: pick(random, [100, 150, 200, 250]),
        durationDays: pick(random, [30, 45, 60, 90]),
        lecturesCount: randomInt(random, 4, 20),
        createdAt: new Date(Date.now() - randomInt(random, 10, 300) * DAY_MS).toISOString(),
        studentsCount,
        activeStudentsCount: Math.round(studentsCount * (0.4 + random() * 0.6)),
        averageProgress: studentsCount ? randomInt(random, 10, 90) : 0,
        accessCodes: {
          total: totalCodes,
          used: studentsCount,
          available: totalCodes - studentsCount,
        },
      };
    }
  );

  return {
    stats: {
      totalCourses: courses.length,
      publishedCourses: courses.filter((course) => course.status === "published").length,
      totalStudents: courses.reduce((sum, course) => sum + course.studentsCount, 0),
      activeStudents: courses.reduce((sum, course) => sum + course.activeStudentsCount, 0),
    },
    courses,
  };
}

function buildMockUser(id: string, random: Random): User {
  const now = new Date().toISOString();
  return {
    _id: id,
    email: "sample.student@example.com",
    username: "sample.student",
    fullname: "Sample Student",
    role: "student",
    status: "approved",
    lastLoginAt: new Date(Date.now() - randomInt(random, 1, 10) * DAY_MS).toISOString(),
    createdAt: new Date(Date.now() - randomInt(random, 30, 365) * DAY_MS).toISOString(),
    updatedAt: now,
  };
}

export function buildMockUserDetails(id: string, knownUser?: User): UserDetails {
  const random = createRandom(id);
  const user = knownUser ?? buildMockUser(id, random);

  if (user.role === "student") {
    return { user, student: buildStudentDetails(random, id) };
  }

  if (user.role === "instructor") {
    return { user, instructor: buildInstructorDetails(random, id) };
  }

  return { user };
}
