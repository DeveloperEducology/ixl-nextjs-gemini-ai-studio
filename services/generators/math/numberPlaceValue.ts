import { SeededRandom } from '../../../utils/SeededRandom';
import { Question } from '../../../types';

function mcqTemplate({ topicId, prompt, correct, wrongs, difficulty }: any): Question {
  const all = [correct, ...wrongs];
  const shuffled = all.sort(() => Math.random() - 0.5).slice(0, 4);

  return {
    id: `NPV_${topicId}_${Date.now()}`,
    skillId: topicId,
    type: 'multiple-choice',
    prompt: { text: prompt },
    options: shuffled.map((opt: any, i: number) => ({
      id: String.fromCharCode(65 + i),
      content: opt.toString(),
      isCorrect: opt === correct
    })),
    correctAnswer: correct.toString(),
    explanation: { text: `The correct answer is ${correct}.` }
  };
}

function getRangeByDifficulty(difficulty: string) {
  switch (difficulty) {
    case "easy": return { min: 0, max: 50 };
    case "hard": return { min: 100, max: 9999 };
    default: return { min: 0, max: 999 };
  }
}

function genNumberRecognition(random: SeededRandom, difficulty: string, topicId: string) {
  const { min, max } = getRangeByDifficulty(difficulty);
  const n = random.int(min, max);
  const wrongs = [n + 1, n - 1 >= 0 ? n - 1 : n + 2, n + 10];
  return mcqTemplate({ topicId, prompt: `Which number is shown? (Assume image of blocks representing ${n})`, correct: n, wrongs, difficulty });
}

function genCountingForward(random: SeededRandom, difficulty: string, topicId: string) {
  const { min, max } = getRangeByDifficulty(difficulty);
  const start = random.int(min, max - 3);
  return mcqTemplate({ topicId, prompt: `Continue the pattern: ${start}, ${start+1}, ${start+2}, ___`, correct: start+3, wrongs: [start+2, start+4, start+5], difficulty });
}

function genCountingBackward(random: SeededRandom, difficulty: string, topicId: string) {
  const { min, max } = getRangeByDifficulty(difficulty);
  const start = random.int(min + 3, max);
  return mcqTemplate({ topicId, prompt: `Continue the pattern: ${start}, ${start-1}, ${start-2}, ___`, correct: start-3, wrongs: [start-2, start-4, start-5], difficulty });
}

function genComparingNumbers(random: SeededRandom, difficulty: string, topicId: string) {
  const { min, max } = getRangeByDifficulty(difficulty);
  let a = random.int(min, max);
  let b = random.int(min, max);
  if (a === b) b = a + 1;
  const correct = a > b ? ">" : "<";
  return mcqTemplate({ topicId, prompt: `Compare: ${a} __ ${b}`, correct, wrongs: [a > b ? "<" : ">", "="], difficulty });
}

function genPlaceValue(random: SeededRandom, difficulty: string, topicId: string) {
  const { min, max } = getRangeByDifficulty(difficulty);
  const n = random.int(Math.max(10, min), max);
  const s = n.toString();
  const digitIdx = random.int(0, s.length - 1);
  const digit = parseInt(s[digitIdx]);
  const placeNames = ["ones", "tens", "hundreds", "thousands"];
  // s is like "123". len=3. idx=0 -> '1' -> hundreds. power = len-1-idx
  const power = s.length - 1 - digitIdx;
  const value = digit * Math.pow(10, power);
  const placeName = power === 0 ? "ones" : power === 1 ? "tens" : power === 2 ? "hundreds" : "thousands";
  
  return mcqTemplate({
    topicId,
    prompt: `In the number ${n}, what is the value of the digit in the ${placeName} place?`,
    correct: value,
    wrongs: [value * 10, value + 1, digit],
    difficulty
  });
}

function genExpandedForm(random: SeededRandom, difficulty: string, topicId: string) {
  const { min, max } = getRangeByDifficulty(difficulty);
  const n = random.int(Math.max(10, min), max);
  const digits = n.toString().split('').map(Number);
  const expanded = digits.map((d, i) => d * Math.pow(10, digits.length - 1 - i)).filter(x => x > 0).join(" + ");
  
  return mcqTemplate({ topicId, prompt: `Which shows ${n} in expanded form?`, correct: expanded, wrongs: [expanded + " + 1", expanded.replace('+', '-'), "0"], difficulty });
}

function genEvenOdd(random: SeededRandom, difficulty: string, topicId: string) {
  const { min, max } = getRangeByDifficulty(difficulty);
  const n = random.int(min, max);
  const correct = n % 2 === 0 ? "Even" : "Odd";
  return mcqTemplate({ topicId, prompt: `Is ${n} even or odd?`, correct, wrongs: [correct === "Even" ? "Odd" : "Even"], difficulty });
}

export function generateNumberPlaceValueQuestion(topicId: string, difficulty = "medium", seed: number | null = null): Question {
  const random = new SeededRandom(seed || Date.now());
  const map: any = {
    "npv-number-recognition": genNumberRecognition,
    "npv-counting-forward": genCountingForward,
    "npv-counting-backward": genCountingBackward,
    "npv-comparing": genComparingNumbers,
    "npv-place-value": genPlaceValue,
    "npv-expanded-form": genExpandedForm,
    "npv-even-odd": genEvenOdd
  };
  const gen = map[topicId];
  if (!gen) return genNumberRecognition(random, difficulty, topicId);
  return gen(random, difficulty, topicId);
}
