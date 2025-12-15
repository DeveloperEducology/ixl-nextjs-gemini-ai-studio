
import { generateAdditionQuestion } from './generators/math/addition';
import { generateNumberPlaceValueQuestion } from './generators/math/numberPlaceValue';
import { 
  generateRepeatedAdditionQuestion,
  generateTimesTableQuestion,
  generateMultiplyingNumbersQuestion,
  generateMultiplicationWordProblem,
  generateMultiplicationPropertyQuestion
} from './generators/math/multiplication';
import { generateSortingQuestion } from './generators/math/sorting';
import { generateGraphingQuestion } from './generators/math/graphing';
import { generateDragDropQuestion } from './generators/math/dragAndDrop';
import { generateNumberLineQuestion } from './generators/math/numberLine';
import { generateVerticalQuestion } from './generators/math/vertical';
import { Question } from '../types';

export const QUESTION_GENERATORS: Record<string, (difficulty: string, seed: number | null) => Question> = {
    // Multiplication
    "g1-mul-repeated-addition": (diff, seed) => generateRepeatedAdditionQuestion(1, diff, seed),
    "g2-mul-repeated-addition": (diff, seed) => generateRepeatedAdditionQuestion(2, diff, seed),
    "g3-mul-repeated-addition": (diff, seed) => generateRepeatedAdditionQuestion(3, diff, seed),
    "g4-mul-repeated-addition": (diff, seed) => generateRepeatedAdditionQuestion(4, diff, seed),
    
    "g2-mul-tables": (diff, seed) => generateTimesTableQuestion(2, diff, seed),
    "g3-mul-tables": (diff, seed) => generateTimesTableQuestion(3, diff, seed),
    "g4-mul-tables": (diff, seed) => generateTimesTableQuestion(4, diff, seed),
    
    "g3-mul-numbers": (diff, seed) => generateMultiplyingNumbersQuestion(3, diff, seed),
    "g4-mul-numbers": (diff, seed) => generateMultiplyingNumbersQuestion(4, diff, seed),
    
    "g2-mul-word": (diff, seed) => generateMultiplicationWordProblem(2, diff, seed),
    "g3-mul-word": (diff, seed) => generateMultiplicationWordProblem(3, diff, seed),
    
    "g3-mul-properties": (diff, seed) => generateMultiplicationPropertyQuestion(3, diff, seed),
    "g4-mul-steps": (diff, seed) => generateVerticalQuestion("g4-mul-steps", diff, seed),

    // Addition
    "g1-add-pictures": (diff, seed) => generateAdditionQuestion("g1-add-pictures", diff, seed),
    "g1-add-single-digit": (diff, seed) => generateAdditionQuestion("g1-add-single-digit", diff, seed),
    "g1-add-making-10": (diff, seed) => generateAdditionQuestion("g1-add-making-10", diff, seed),
    "g1-add-word": (diff, seed) => generateAdditionQuestion("g1-add-word", diff, seed),

    "g2-add-single-digit": (diff, seed) => generateAdditionQuestion("g2-add-single-digit", diff, seed),
    "g2-add-2digit-1digit": (diff, seed) => generateAdditionQuestion("g2-add-2digit-1digit", diff, seed),
    "g2-add-two-2digit": (diff, seed) => generateAdditionQuestion("g2-add-two-2digit", diff, seed),
    "g2-add-making-100": (diff, seed) => generateAdditionQuestion("g2-add-making-100", diff, seed),
    "g2-add-word": (diff, seed) => generateAdditionQuestion("g2-add-word", diff, seed),

    "g3-add-3digit-3digit": (diff, seed) => generateAdditionQuestion("g3-add-3digit-3digit", diff, seed),
    "g3-add-with-regrouping": (diff, seed) => generateAdditionQuestion("g3-add-with-regrouping", diff, seed),
    "g3-add-estimate": (diff, seed) => generateAdditionQuestion("g3-add-estimate", diff, seed),

    "g4-add-multi-digit": (diff, seed) => generateAdditionQuestion("g4-add-multi-digit", diff, seed),
    "g4-add-round-and-add": (diff, seed) => generateAdditionQuestion("g4-add-round-and-add", diff, seed),
    
    "g5-add-decimal": (diff, seed) => generateAdditionQuestion("g5-add-decimal", diff, seed),
    "g5-add-fractions-like": (diff, seed) => generateAdditionQuestion("g5-add-fractions-like", diff, seed),

    // Number Place Value
    "npv-number-recognition": (diff, seed) => generateNumberPlaceValueQuestion("npv-number-recognition", diff, seed),
    "npv-counting-forward": (diff, seed) => generateNumberPlaceValueQuestion("npv-counting-forward", diff, seed),
    "npv-counting-backward": (diff, seed) => generateNumberPlaceValueQuestion("npv-counting-backward", diff, seed),
    "npv-comparing": (diff, seed) => generateNumberPlaceValueQuestion("npv-comparing", diff, seed),
    "npv-place-value": (diff, seed) => generateNumberPlaceValueQuestion("npv-place-value", diff, seed),
    "npv-expanded-form": (diff, seed) => generateNumberPlaceValueQuestion("npv-expanded-form", diff, seed),
    "npv-even-odd": (diff, seed) => generateNumberPlaceValueQuestion("npv-even-odd", diff, seed),

    // Sorting / Ordering
    "g1-order-numbers": (diff, seed) => generateSortingQuestion("g1-order-numbers", diff, seed),
    "g3-order-decimals": (diff, seed) => generateSortingQuestion("g3-order-decimals", diff, seed),
    "g4-order-numbers-large": (diff, seed) => generateSortingQuestion("g4-order-numbers-large", diff, seed),
    "g4-order-fractions-like": (diff, seed) => generateSortingQuestion("g4-order-fractions-like", diff, seed),
    "g5-order-fractions-unlike": (diff, seed) => generateSortingQuestion("g5-order-fractions-unlike", diff, seed),
    "g6-order-integers": (diff, seed) => generateSortingQuestion("g6-order-integers", diff, seed),

    // Graphing
    "g5-graph-points": (diff, seed) => generateGraphingQuestion("g5-graph-points", diff, seed),
    "geo-plot-points": (diff, seed) => generateGraphingQuestion("g5-graph-points", diff, seed), // Alias

    // Drag and Drop
    "g2-even-odd-drag": (diff, seed) => generateDragDropQuestion("g2-even-odd-drag", diff, seed),

    // Number Line
    "nl-find-integer": (diff, seed) => generateNumberLineQuestion("nl-find-integer", diff, seed),
    "nl-select-odd": (diff, seed) => generateNumberLineQuestion("nl-select-odd", diff, seed),
    
    // Misc aliases for prompt
    "fib-equation": (diff, seed) => generateAdditionQuestion("g1-add-making-10", diff, seed), // simplified override
    "mul-pattern-powers": (diff, seed) => generateRepeatedAdditionQuestion(3, diff, seed), // simplified override
};

export function generateQuestion(topicId: string, difficulty: string = "medium", seed: number | null = null): Question {
    const generator = QUESTION_GENERATORS[topicId];
    if (generator) {
        return generator(difficulty, seed);
    }
    throw new Error(`No generator found for topic: ${topicId}`);
}
