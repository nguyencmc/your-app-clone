import { ReviewState, ReviewResult, SM2Grade } from './types';

/**
 * SM-2 Spaced Repetition Algorithm (Anki-style)
 * 
 * Grade scale:
 * 0 - Complete blackout
 * 1 - Incorrect; upon seeing correct, it was remembered (Again)
 * 2 - Incorrect; but correct answer was easy to recall
 * 3 - Correct with serious difficulty (Hard)
 * 4 - Correct with some hesitation (Good)
 * 5 - Perfect response (Easy)
 */
export function sm2Next(state: ReviewState, grade: SM2Grade): ReviewResult {
  const { interval_days, ease, repetitions } = state;
  
  // Calculate new ease factor (EF)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const q = grade;
  let newEase = ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  
  // EF minimum is 1.3
  newEase = Math.max(1.3, newEase);
  
  let newRepetitions: number;
  let newInterval: number;
  let nextDue: Date;
  
  if (q < 3) {
    // Failed: reset repetitions
    newRepetitions = 0;
    newInterval = 0;
    
    // Set due time based on grade
    const now = new Date();
    if (q <= 1) {
      // Again: due in 10 minutes
      nextDue = new Date(now.getTime() + 10 * 60 * 1000);
    } else {
      // q = 2: due in 30 minutes (if we ever use it)
      nextDue = new Date(now.getTime() + 30 * 60 * 1000);
    }
  } else {
    // Passed: increment repetitions
    newRepetitions = repetitions + 1;
    
    // Calculate interval based on repetition count
    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      // n >= 3: interval = round(previous_interval * EF)
      newInterval = Math.round(interval_days * newEase);
    }
    
    // Ensure minimum interval of 1 day
    newInterval = Math.max(1, newInterval);
    
    // Calculate due date
    const now = new Date();
    nextDue = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);
  }
  
  return {
    next_interval_days: newInterval,
    next_ease: Math.round(newEase * 100) / 100, // Round to 2 decimals
    next_repetitions: newRepetitions,
    next_due_at: nextDue,
  };
}

/**
 * Get preview of next due time for each grade option
 */
export function getGradePreviews(state: ReviewState): Record<string, string> {
  const grades: SM2Grade[] = [1, 3, 4, 5];
  const labels = ['again', 'hard', 'good', 'easy'];
  
  const previews: Record<string, string> = {};
  
  grades.forEach((grade, idx) => {
    const result = sm2Next(state, grade);
    previews[labels[idx]] = formatDuePreview(result.next_due_at);
  });
  
  return previews;
}

/**
 * Format due date as human-readable preview
 */
function formatDuePreview(due: Date): string {
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / (60 * 1000));
  const diffHours = Math.round(diffMs / (60 * 60 * 1000));
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
  
  if (diffMins < 60) {
    return `${diffMins}m`;
  } else if (diffHours < 24) {
    return `${diffHours}h`;
  } else if (diffDays === 1) {
    return '1d';
  } else if (diffDays < 30) {
    return `${diffDays}d`;
  } else if (diffDays < 365) {
    const months = Math.round(diffDays / 30);
    return `${months}mo`;
  } else {
    const years = Math.round(diffDays / 365);
    return `${years}y`;
  }
}
