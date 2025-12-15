export const calculateSmartScore = (
  currentScore: number,
  isCorrect: boolean,
  streak: number
): number => {
  if (isCorrect) {
    let increment = 0;
    if (currentScore < 50) {
      increment = 10;
    } else if (currentScore < 70) {
      increment = 5;
    } else if (currentScore < 90) {
      increment = 2;
    } else {
      // Challenge Zone
      increment = 1;
    }
    return Math.min(100, currentScore + increment);
  } else {
    // Penalty logic
    // If score is 0, stay 0.
    if (currentScore === 0) return 0;

    // Loss is roughly 10% but capped to not be too punishing at low levels
    // In real IXL, it's dynamic based on consistency, but this approximates it.
    const penalty = Math.max(2, Math.floor(currentScore * 0.1));
    return Math.max(0, currentScore - penalty);
  }
};