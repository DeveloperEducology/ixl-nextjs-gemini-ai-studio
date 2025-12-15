
import { SeededRandom } from '../../../utils/SeededRandom';
import { Question, SortingItem } from '../../../types';

function sortingTemplate({ topicId, prompt, items, correctOrder }: any): Question {
  return {
    id: `SORT_${topicId}_${Date.now()}`,
    skillId: topicId,
    type: 'sorting',
    prompt: { text: prompt },
    items: items,
    correctOrder: correctOrder,
    correctAnswer: "See correct order below", // Fallback text
    explanation: {
      text: "The items should be arranged in the following order:",
      steps: correctOrder.map((id: string) => {
          const item = items.find((i: any) => i.id === id);
          return item ? item.content : "";
      })
    }
  };
}

function shuffleItems(random: SeededRandom, items: SortingItem[]) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = random.int(0, i);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 1. Order Integers
function genOrderIntegers(random: SeededRandom, difficulty: string, topicId: string) {
  let min = 0, max = 20, count = 3;
  if (difficulty === "medium") { min = 10; max = 100; count = 4; }
  if (difficulty === "hard") { min = 100; max = 1000; count = 5; }

  const numbers = new Set<number>();
  while (numbers.size < count) {
    numbers.add(random.int(min, max));
  }
  
  const sortedNums = Array.from(numbers).sort((a, b) => a - b);
  
  const items: SortingItem[] = sortedNums.map((n) => ({
    id: `item-${n}`,
    content: n.toString()
  }));

  const correctOrder = items.map(i => i.id);
  const shuffled = shuffleItems(random, items);

  return sortingTemplate({
    topicId,
    prompt: "Arrange these numbers from least to greatest.",
    items: shuffled,
    correctOrder
  });
}

// 2. Order Decimals
function genOrderDecimals(random: SeededRandom, difficulty: string, topicId: string) {
  let count = 4;
  const numbers = new Set<string>();
  
  while (numbers.size < count) {
    const n = random.int(0, 100) + random.random();
    numbers.add(n.toFixed(difficulty === 'easy' ? 1 : 2));
  }

  const sortedNums = Array.from(numbers).sort((a, b) => parseFloat(a) - parseFloat(b));

  const items: SortingItem[] = sortedNums.map((n) => ({
    id: `item-${n}`,
    content: n
  }));

  const correctOrder = items.map(i => i.id);
  const shuffled = shuffleItems(random, items);

  return sortingTemplate({
    topicId,
    prompt: "Arrange these decimals from least to greatest.",
    items: shuffled,
    correctOrder
  });
}

// 3. Order Fractions
function genOrderFractions(random: SeededRandom, difficulty: string, topicId: string) {
  const count = 4;
  const fractions: { num: number, den: number, val: number, str: string }[] = [];
  const distinctValues = new Set<number>();

  const isLike = difficulty === "easy"; // Like denominators for easy

  const commonDenom = random.int(3, 12);

  while (fractions.length < count) {
    let num, den;
    
    if (isLike) {
      den = commonDenom;
      num = random.int(1, den * 2); // Can be improper
    } else {
      den = random.int(2, 12);
      num = random.int(1, den - 1); // Proper fractions for hard logic usually
    }

    const val = num / den;

    if (!distinctValues.has(val)) {
      distinctValues.add(val);
      fractions.push({ num, den, val, str: `${num}/${den}` });
    }
  }

  // Sort by value
  fractions.sort((a, b) => a.val - b.val);

  const items: SortingItem[] = fractions.map((f) => ({
    id: `frac-${f.num}-${f.den}`,
    content: f.str
  }));

  const correctOrder = items.map(i => i.id);
  const shuffled = shuffleItems(random, items);

  return sortingTemplate({
    topicId,
    prompt: isLike 
      ? "Arrange these fractions from least to greatest." 
      : "Arrange these fractions from least to greatest.",
    items: shuffled,
    correctOrder
  });
}

// 4. Order Negative Numbers (Integers)
function genOrderNegativeNumbers(random: SeededRandom, difficulty: string, topicId: string) {
  let count = 4;
  let min = -20, max = 20;

  const numbers = new Set<number>();
  
  // Ensure at least one negative and one positive
  numbers.add(random.int(-20, -1));
  numbers.add(random.int(0, 20));

  while (numbers.size < count) {
    numbers.add(random.int(min, max));
  }
  
  const sortedNums = Array.from(numbers).sort((a, b) => a - b);
  
  const items: SortingItem[] = sortedNums.map((n) => ({
    id: `item-${n}`,
    content: n.toString()
  }));

  const correctOrder = items.map(i => i.id);
  const shuffled = shuffleItems(random, items);

  return sortingTemplate({
    topicId,
    prompt: "Arrange these integers from least to greatest.",
    items: shuffled,
    correctOrder
  });
}

export function generateSortingQuestion(topicId: string, difficulty: string = "medium", seed: number | null = null): Question {
  const random = new SeededRandom(seed || Date.now());

  switch (topicId) {
    case "g1-order-numbers":
      return genOrderIntegers(random, difficulty, topicId);
    case "g3-order-decimals":
      return genOrderDecimals(random, difficulty, topicId);
    case "g4-order-numbers-large":
      return genOrderIntegers(random, "hard", topicId);
    case "g4-order-fractions-like":
      return genOrderFractions(random, "easy", topicId);
    case "g5-order-fractions-unlike":
      return genOrderFractions(random, "hard", topicId);
    case "g6-order-integers":
      return genOrderNegativeNumbers(random, difficulty, topicId);
    default:
      return genOrderIntegers(random, difficulty, topicId);
  }
}
