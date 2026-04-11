import type { FormWithQuestions } from '@/lib/types/database';

export interface QuizQuestionResult {
  question_id: string;
  is_correct: boolean;
  points_awarded: number;
  points_possible: number;
  feedback?: string;
  correct_answer?: string;
}

export interface QuizScoreResult {
  score: number;
  maxScore: number;
  percentage: number;
  results: QuizQuestionResult[];
}

const normalizeText = (value: unknown) => String(value ?? '').trim().toLowerCase();

function parseCheckboxAnswer(answer: unknown): string[] {
  if (Array.isArray(answer)) {
    return answer.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof answer === 'string') {
    try {
      const parsed = JSON.parse(answer);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      return answer.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }

  return [];
}

function getAnswerValue(answer: { answer_text?: string; answer_data?: Record<string, any> } | undefined): string {
  if (!answer) return '';

  if (typeof answer.answer_text === 'string' && answer.answer_text.trim().length > 0) {
    return answer.answer_text;
  }

  if (answer.answer_text !== undefined && answer.answer_text !== null) {
    return String(answer.answer_text);
  }

  if (answer.answer_data && typeof answer.answer_data === 'object') {
    const values = Object.values(answer.answer_data).filter(Boolean);
    if (values.length > 0) {
      return String(values[0]);
    }
  }

  return '';
}

function getQuestionCorrectAnswer(question: FormWithQuestions['questions'][number]): string | string[] | null {
  const settings = question.settings || {};

  if (Array.isArray(settings.correctAnswers) && settings.correctAnswers.length > 0) {
    return settings.correctAnswers;
  }

  if (typeof settings.correctAnswer === 'string' && settings.correctAnswer.trim()) {
    return settings.correctAnswer.trim();
  }

  return null;
}

export function calculateQuizScore(
  form: FormWithQuestions,
  submittedAnswers: Array<{ question_id: string; answer_text?: string; answer_data?: Record<string, any> }>
): QuizScoreResult {
  let score = 0;
  let maxScore = 0;

  const results = form.questions.map((question) => {
    const pointsPossible = Number(question.settings?.points ?? 1);
    const correctAnswer = getQuestionCorrectAnswer(question);
    const submitted = submittedAnswers.find((answer) => answer.question_id === question.id);
    const submittedValue = getAnswerValue(submitted);

    if (correctAnswer === null || Number.isNaN(pointsPossible) || pointsPossible <= 0) {
      return {
        question_id: question.id,
        is_correct: false,
        points_awarded: 0,
        points_possible: 0,
      } satisfies QuizQuestionResult;
    }

    maxScore += pointsPossible;

    let isCorrect = false;

    if (question.type === 'checkboxes') {
      const submittedValues = parseCheckboxAnswer(submitted?.answer_text ?? submitted?.answer_data);
      const correctValues = Array.isArray(correctAnswer) ? correctAnswer : String(correctAnswer).split(',');
      const normalizedSubmitted = submittedValues.map(normalizeText).sort();
      const normalizedCorrect = correctValues.map(normalizeText).filter(Boolean).sort();
      isCorrect =
        normalizedSubmitted.length === normalizedCorrect.length &&
        normalizedSubmitted.every((value, index) => value === normalizedCorrect[index]);
    } else if (question.type === 'linear_scale') {
      isCorrect = normalizeText(submittedValue) === normalizeText(correctAnswer);
    } else {
      isCorrect = normalizeText(submittedValue) === normalizeText(correctAnswer);
    }

    const awarded = isCorrect ? pointsPossible : 0;
    score += awarded;

    return {
      question_id: question.id,
      is_correct: isCorrect,
      points_awarded: awarded,
      points_possible: pointsPossible,
      feedback: isCorrect ? question.settings?.feedbackCorrect : question.settings?.feedbackIncorrect,
      correct_answer: Array.isArray(correctAnswer) ? correctAnswer.join(', ') : correctAnswer,
    } satisfies QuizQuestionResult;
  });

  return {
    score,
    maxScore,
    percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
    results,
  };
}
