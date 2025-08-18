import { randomBytes } from 'crypto';

export const generateQuizId = (): string => {
  return `quiz_${randomBytes(8).toString('hex')}`;
};

export const generateAttemptId = (): string => {
  return `attempt_${randomBytes(8).toString('hex')}`;
};

export const generateUserId = (): string => {
  return `user_${randomBytes(8).toString('hex')}`;
};

export const generateRecommendationId = (): string => {
  return `rec_${randomBytes(8).toString('hex')}`;
};