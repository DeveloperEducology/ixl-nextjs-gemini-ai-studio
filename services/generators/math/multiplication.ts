import { SeededRandom } from '../../../utils/SeededRandom';
import { Question } from '../../../types';

const gradeDifficultyConfig: any = {
  1: { repeatedAddition: { groups: [2, 4], factor: [1, 5] }, timesTable: { base: [2, 5], mult: [1, 5] }, multiply: { a: [1, 5], b: [1, 5] } },
  2: { repeatedAddition: { groups: [2, 6], factor: [2, 9] }, timesTable: { base: [2, 9], mult: [1, 10] }, multiply: { a: [2, 9], b: [2, 9] } },
  3: { repeatedAddition: { groups: [2, 7], factor: [2, 12] }, timesTable: { base: [2, 12], mult: [1, 12] }, multiply: { a: [2, 12], b: [2, 12] } },
  4: { repeatedAddition: { groups: [3, 8], factor: [3, 12] }, timesTable: { base: [2, 12], mult: [2, 12] }, multiply: { a: [10, 99], b: [2, 9] } },
  5: { repeatedAddition: { groups: [3, 10], factor: [3, 12] }, timesTable: { base: [2, 12], mult: [2, 15] }, multiply: { a: [50, 999], b: [2, 99] } }
};

function adjustByDifficulty(range: number[], difficulty: string) {
  const [min, max] = range;
  if (difficulty === "easy") return [min, (min + max) >> 1];
  if (difficulty === "hard") return [((min + max) >> 1) + 1, max];
  return range;
}

function pickInt(random: SeededRandom, range: number[], difficulty: string) {
  const [min, max] = adjustByDifficulty(range, difficulty);
  return random.int(min, max);
}

function shuffleArray(random: SeededRandom, arr: any[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = random.int(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function gradeToLabel(grade: number) {
  return grade.toString();
}

export function generateRepeatedAdditionQuestion(grade = 3, difficulty = "medium", seed: number | null = null): Question {
  const random = new SeededRandom(seed || Date.now());
  const cfg = gradeDifficultyConfig[grade] || gradeDifficultyConfig[3];

  const groups = pickInt(random, cfg.repeatedAddition.groups, difficulty);
  const factor = pickInt(random, cfg.repeatedAddition.factor, difficulty);
  
  const repeated = Array.from({ length: groups }, () => factor).join(" + ");
  const correct = `${groups} × ${factor}`;
  const distractors = new Set<string>();
  distractors.add(`${factor} × ${groups}`);
  distractors.add(`${groups + 1} × ${factor}`);
  distractors.add(`${groups} × ${factor - 1}`);

  const optionsRaw = shuffleArray(random, [correct, ...Array.from(distractors)].slice(0, 4));
  
  return {
    id: `MATH_MUL_REPEAT_G${grade}_${Date.now()}`,
    skillId: "MATH.MUL.REPEATED_ADDITION",
    type: 'multiple-choice',
    prompt: {
        text: `Write this repeated addition as a multiplication sentence:\n\n${repeated}`
    },
    options: optionsRaw.map((opt: string, i: number) => ({
      id: String.fromCharCode(65 + i),
      content: opt,
      isCorrect: opt === correct
    })),
    correctAnswer: correct,
    explanation: {
        steps: [
            `Count how many times the number is added. ${factor} is added ${groups} times.`,
            `Write as groups × size of each group.`,
            `So the multiplication is ${groups} × ${factor}.`
        ]
    }
  };
}

export function generateTimesTableQuestion(grade = 3, difficulty = "medium", seed: number | null = null): Question {
  const random = new SeededRandom(seed || Date.now());
  const cfg = gradeDifficultyConfig[grade] || gradeDifficultyConfig[3];

  const base = pickInt(random, cfg.timesTable.base, difficulty);
  const mult = pickInt(random, cfg.timesTable.mult, difficulty);
  const product = base * mult;

  const correct = product;
  const wrongs = new Set<number>();
  wrongs.add(product + base);
  wrongs.add(product - base);
  wrongs.add(base * (mult + 1));

  const allOptions = shuffleArray(random, [correct, ...Array.from(wrongs)].slice(0, 4));

  return {
    id: `MATH_MUL_TABLE_G${grade}_${Date.now()}`,
    skillId: "MATH.MUL.TIMES_TABLES",
    type: 'multiple-choice',
    prompt: {
        text: `What is ${base} × ${mult}?`
    },
    options: allOptions.map((val: number, i: number) => ({
      id: String.fromCharCode(65 + i),
      content: val.toString(),
      isCorrect: val === correct
    })),
    correctAnswer: correct.toString(),
    explanation: {
        text: `${base} × ${mult} means adding ${base} a total of ${mult} times, which equals ${product}.`
    }
  };
}

export function generateMultiplyingNumbersQuestion(grade = 3, difficulty = "medium", seed: number | null = null): Question {
  const random = new SeededRandom(seed || Date.now());
  const cfg = gradeDifficultyConfig[grade] || gradeDifficultyConfig[3];

  let a = pickInt(random, cfg.multiply.a, difficulty);
  let b = pickInt(random, cfg.multiply.b, difficulty);

  // Keep numbers small for low grades
  if (grade <= 2) { a = Math.min(a, 9); b = Math.min(b, 9); }
  else if (grade === 3) { a = Math.min(a, 12); b = Math.min(b, 12); }

  const product = a * b;
  const correct = product;
  const wrongs = new Set<number>();
  wrongs.add(a + b);
  wrongs.add(a * (b - 1));
  wrongs.add((a - 1) * b);

  const allOptions = shuffleArray(random, [correct, ...Array.from(wrongs)].slice(0, 4));

  return {
    id: `MATH_MUL_NUMBERS_G${grade}_${Date.now()}`,
    skillId: "MATH.MUL.MULTI_DIGIT",
    type: 'multiple-choice',
    prompt: {
        text: `What is ${a} × ${b}?`
    },
    options: allOptions.map((val: number, i: number) => ({
      id: String.fromCharCode(65 + i),
      content: val.toString(),
      isCorrect: val === correct
    })),
    correctAnswer: correct.toString(),
    explanation: { text: `${a} × ${b} = ${product}.` }
  };
}

export function generateMultiplicationWordProblem(grade = 3, difficulty = "medium", seed: number | null = null): Question {
  const random = new SeededRandom(seed || Date.now());
  const cfg = gradeDifficultyConfig[grade] || gradeDifficultyConfig[3];

  const a = pickInt(random, cfg.multiply.a, difficulty);
  const b = pickInt(random, cfg.multiply.b, difficulty);
  const product = a * b;

  const templates = [
    (a: number, b: number) => ({ story: `There are ${a} rows of chairs. Each row has ${b} chairs. How many chairs are there in total?`, unit: "chairs" }),
    (a: number, b: number) => ({ story: `${a} boxes each contain ${b} apples. How many apples are there altogether?`, unit: "apples" }),
    (a: number, b: number) => ({ story: `A bus makes ${a} trips and carries ${b} passengers each time. How many passengers in all?`, unit: "passengers" })
  ];

  const templateFn = templates[random.int(0, templates.length - 1)];
  const { story, unit } = templateFn(a, b);

  const correct = product;
  const wrongs = new Set<number>();
  wrongs.add(a + b);
  wrongs.add(a * (b - 1));
  wrongs.add((a + 1) * b);

  const allOptions = shuffleArray(random, [correct, ...Array.from(wrongs)].slice(0, 4));

  return {
    id: `MATH_MUL_WORD_G${grade}_${Date.now()}`,
    skillId: "MATH.MUL.WORD_PROBLEMS",
    type: 'multiple-choice',
    prompt: {
        text: story
    },
    options: allOptions.map((val: number, i: number) => ({
      id: String.fromCharCode(65 + i),
      content: `${val} ${unit}`,
      isCorrect: val === correct
    })),
    correctAnswer: `${correct} ${unit}`,
    explanation: {
        text: `We have ${a} groups of ${b} ${unit}. So we multiply: ${a} × ${b} = ${product} ${unit}.`
    }
  };
}

export function generateMultiplicationPropertyQuestion(grade = 3, difficulty = "medium", seed: number | null = null): Question {
  const random = new SeededRandom(seed || Date.now());
  const props = [
    { id: "commutative", label: "Commutative Property", make: () => { const a = random.int(2,9), b = random.int(2,9); return `${a} × ${b} = ${b} × ${a}`; } },
    { id: "associative", label: "Associative Property", make: () => { const a = random.int(2,5), b = random.int(2,5), c = random.int(2,5); return `(${a} × ${b}) × ${c} = ${a} × (${b} × ${c})`; } },
    { id: "identity", label: "Identity Property", make: () => { const a = random.int(2,20); return `${a} × 1 = ${a}`; } },
    { id: "zero", label: "Zero Property", make: () => { const a = random.int(2,20); return `${a} × 0 = 0`; } }
  ];

  const prop = props[random.int(0, props.length - 1)];
  const expression = prop.make();

  const correct = prop.label;
  const shuffledLabels = shuffleArray(random, props.map(p => p.label));

  return {
    id: `MATH_MUL_PROP_G${grade}_${Date.now()}`,
    skillId: "MATH.MUL.PROPERTIES",
    type: 'multiple-choice',
    prompt: {
        text: `Which property of multiplication does this equation show?\n\n${expression}`
    },
    options: shuffledLabels.map((label: string, i: number) => ({
      id: String.fromCharCode(65 + i),
      content: label,
      isCorrect: label === correct
    })),
    correctAnswer: correct,
    explanation: { text: `This is the ${correct}.` }
  };
}
