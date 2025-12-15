import { SeededRandom } from '../../../utils/SeededRandom';
import { Question, QuestionType } from '../../../types';

function mcqTemplate({
  topicId,
  prompt,
  correct,
  wrongs,
  difficulty = "medium",
}: any): Question {
  const allValues = [correct, ...wrongs];
  // Simple shuffle
  const shuffled = allValues
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
    .slice(0, 4);

  const options = shuffled.map((opt: any, i: number) => ({
    id: String.fromCharCode(65 + i),
    content: opt.toString(),
    isCorrect: opt === correct,
  }));

  return {
    id: `ADD_${topicId}_${Date.now()}`,
    type: 'multiple-choice',
    skillId: topicId,
    prompt: { text: prompt },
    explanation: {
      text: `The correct answer is ${correct}.`,
    },
    options,
    correctAnswer: correct.toString()
  };
}

// Generators

function genAddPictures(random: SeededRandom, difficulty: string, topicId: string) {
  const c1 = random.int(1, 5);
  const c2 = random.int(1, 5);
  const emoji = "🍎";

  return mcqTemplate({
    topicId,
    prompt: `Count and add:\n\n${emoji.repeat(c1)} + ${emoji.repeat(c2)}`,
    correct: c1 + c2,
    wrongs: [c1 + c2 - 1, c1 + c2 + 1, c1 + c2 + 2],
    difficulty,
  });
}

function genAddSingleDigit(random: SeededRandom, difficulty: string, topicId: string) {
  const a = random.int(1, difficulty === "easy" ? 5 : 9);
  const b = random.int(1, difficulty === "easy" ? 5 : 9);

  return mcqTemplate({
    topicId,
    prompt: `What is ${a} + ${b}?`,
    correct: a + b,
    wrongs: [a + b - 1, a + b + 1, a + b + 2],
    difficulty,
  });
}

function genAddMaking10(random: SeededRandom, difficulty: string, topicId: string) {
  const a = random.int(1, 9);
  const b = 10 - a;

  return mcqTemplate({
    topicId,
    prompt: `${a} + ___ = 10`,
    correct: b,
    wrongs: [b + 1, b - 1, 10],
    difficulty,
  });
}

function genAddWordProblem(random: SeededRandom, difficulty: string, topicId: string) {
  const a = random.int(5, 50);
  const b = random.int(5, 50);

  const templates = [
    `Ravi has ${a} apples and buys ${b} more. How many apples now?`,
    `A box has ${a} balls and another has ${b}. Total balls?`,
    `${a} children joined the trip and ${b} more joined. Total?`,
  ];

  return mcqTemplate({
    topicId,
    prompt: templates[random.int(0, templates.length - 1)],
    correct: a + b,
    wrongs: [a + b - 1, a + b + 1, a + b + 10],
    difficulty,
  });
}

function genAdd2Digit1Digit(random: SeededRandom, difficulty: string, topicId: string) {
  const a = random.int(10, 99);
  const b = random.int(1, 9);

  return mcqTemplate({
    topicId,
    prompt: `${a} \n+ ${b} \n= ?`,
    correct: a + b,
    wrongs: [a + b - 1, a + b + 1, a + b + 10],
    difficulty,
  });
}

function genAddTwo2Digit(random: SeededRandom, difficulty: string, topicId: string) {
  let a = random.int(10, 99);
  let b = random.int(10, 99);

  // Force no regrouping for this specific type if desired, or random
  if ((a % 10) + (b % 10) >= 10) {
    a = Math.floor(a / 10) * 10 + random.int(0, 4);
    b = Math.floor(b / 10) * 10 + random.int(0, 4);
  }

  return mcqTemplate({
    topicId,
    prompt: `Add (no regrouping): ${a} + ${b}`,
    correct: a + b,
    wrongs: [a + b - 1, a + b + 1, a + b + 10],
    difficulty,
  });
}

function genAddMaking100(random: SeededRandom, difficulty: string, topicId: string) {
  const a = random.int(10, 90);
  const b = 100 - a;

  return mcqTemplate({
    topicId,
    prompt: `${a} + ___ = 100`,
    correct: b,
    wrongs: [b + 10, b - 10, 100],
    difficulty,
  });
}

function genAdd3Digit3Digit(random: SeededRandom, difficulty: string, topicId: string) {
  const a = random.int(100, 999);
  const b = random.int(100, 999);

  return mcqTemplate({
    topicId,
    prompt: `${a} + ${b}`,
    correct: a + b,
    wrongs: [a + b - 10, a + b + 10, a + b + 100],
    difficulty,
  });
}

function genAddWithRegrouping(random: SeededRandom, difficulty: string, topicId: string) {
  let a = random.int(100, 999);
  let b = random.int(100, 999);

  if ((a % 10) + (b % 10) < 10) a += 7; // force regroup

  return mcqTemplate({
    topicId,
    prompt: `Add with regrouping: ${a} + ${b}`,
    correct: a + b,
    wrongs: [a + b - 1, a + b + 1, a + b + 10],
    difficulty,
  });
}

function genAddEstimate(random: SeededRandom, difficulty: string, topicId: string) {
  let a = random.int(100, 999);
  let b = random.int(100, 999);

  const ra = Math.round(a / 100) * 100;
  const rb = Math.round(b / 100) * 100;

  return mcqTemplate({
    topicId,
    prompt: `Estimate: ${a} + ${b}`,
    correct: ra + rb,
    wrongs: [ra + rb - 100, ra + rb + 100, ra + rb + 200],
    difficulty,
  });
}

function genAddMultiDigit(random: SeededRandom, difficulty: string, topicId: string) {
  const a = random.int(1000, 9999);
  const b = random.int(1000, 9999);

  return mcqTemplate({
    topicId,
    prompt: `${a} + ${b}`,
    correct: a + b,
    wrongs: [a + b - 10, a + b + 10, a + b + 100],
    difficulty,
  });
}

function genRoundAndAdd(random: SeededRandom, difficulty: string, topicId: string) {
  const a = random.int(100, 999);
  const b = random.int(100, 999);
  const ra = Math.round(a / 10) * 10;
  const rb = Math.round(b / 10) * 10;

  return mcqTemplate({
    topicId,
    prompt: `Round to nearest 10 and add:\n${a} + ${b}`,
    correct: ra + rb,
    wrongs: [ra + rb + 10, ra + rb - 10, ra + rb + 20],
    difficulty,
  });
}

function genAddDecimal(random: SeededRandom, difficulty: string, topicId: string) {
  const a = (random.int(10, 99) / 10).toFixed(1);
  const b = (random.int(10, 99) / 10).toFixed(1);
  const correct = (parseFloat(a) + parseFloat(b)).toFixed(1);

  return mcqTemplate({
    topicId,
    prompt: `${a} + ${b}`,
    correct,
    wrongs: [
      (parseFloat(correct) - 0.1).toFixed(1),
      (parseFloat(correct) + 0.1).toFixed(1),
      "10.0",
    ],
    difficulty,
  });
}

function genAddFractionsLike(random: SeededRandom, difficulty: string, topicId: string) {
  const denom = [2, 3, 4, 6, 8][random.int(0, 4)];
  const a = random.int(1, denom - 1);
  const b = random.int(1, denom - 1);

  return mcqTemplate({
    topicId,
    prompt: `Add fractions:\n${a}/${denom} + ${b}/${denom}`,
    correct: `${a + b}/${denom}`,
    wrongs: [
      `${a + b - 1}/${denom}`,
      `${a + b + 1}/${denom}`,
      `${a * b}/${denom}`,
    ],
    difficulty,
  });
}

export function generateAdditionQuestion(
  topicId: string,
  difficulty: string = "medium",
  seed: number | null = null
): Question {
  const random = new SeededRandom(seed || Date.now());

  const generators: Record<string, Function> = {
    "g1-add-pictures": genAddPictures,
    "g1-add-single-digit": genAddSingleDigit,
    "g1-add-making-10": genAddMaking10,
    "g1-add-word": genAddWordProblem,
    "g2-add-single-digit": genAddSingleDigit,
    "g2-add-2digit-1digit": genAdd2Digit1Digit,
    "g2-add-two-2digit": genAddTwo2Digit,
    "g2-add-making-100": genAddMaking100,
    "g2-add-word": genAddWordProblem,
    "g3-add-3digit-3digit": genAdd3Digit3Digit,
    "g3-add-with-regrouping": genAddWithRegrouping,
    "g3-add-estimate": genAddEstimate,
    "g3-add-word": genAddWordProblem,
    "g4-add-multi-digit": genAddMultiDigit,
    "g4-add-with-regrouping": genAddWithRegrouping,
    "g4-add-round-and-add": genRoundAndAdd,
    "g4-add-word": genAddWordProblem,
    "g5-add-multi-digit": genAddMultiDigit,
    "g5-add-decimal": genAddDecimal,
    "g5-add-fractions-like": genAddFractionsLike,
    "g5-add-word": genAddWordProblem,
  };

  const generator = generators[topicId];
  if (!generator) {
    throw new Error(`Unknown topicId: ${topicId}`);
  }

  return generator(random, difficulty, topicId);
}
