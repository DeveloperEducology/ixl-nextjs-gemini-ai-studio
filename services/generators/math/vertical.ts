import { SeededRandom } from '../../../utils/SeededRandom';
import { Question, VerticalGridConfig, VerticalRow, VerticalCell } from '../../../types';

function toDigits(n: number): string[] {
    return n.toString().split('');
}

// Generates a vertical multiplication problem with fillable cells
// Currently supports 2-digit x 1-digit or 2-digit x 2-digit
function genVerticalMultiStep(random: SeededRandom, difficulty: string, topicId: string): Question {
    // 2-digit number
    const a = random.int(12, 89);
    // 1-digit number for easy/medium, small 2-digit for hard
    const b = difficulty === 'hard' ? random.int(11, 19) : random.int(2, 9);
    
    const total = a * b;
    
    // Decompose for rows
    const rows: VerticalRow[] = [];
    
    // Top Factor Row
    const aDigits = toDigits(a);
    rows.push({
        type: 'factor',
        cells: aDigits.map(d => ({ val: d, isInput: false }))
    });

    // Bottom Factor Row with Operator
    const bDigits = toDigits(b);
    rows.push({
        type: 'factor-operator',
        operator: '×',
        cells: bDigits.map(d => ({ val: d, isInput: false }))
    });

    // Partial Products (Only if b > 9, otherwise just result)
    if (b > 9) {
        // Not implemented in this simplified generator, focusing on standard 2x1 result filling 
        // or a hardcoded partial structure if needed. 
        // For dynamic 2x2, we need complex logic to calculate partials.
        // Let's stick to 2x1 structure which matches standard 3rd/4th grade intro or use the logic from the prompt example for static structure.
    }

    // Result Row (Masking the answer)
    const resultDigits = toDigits(total);
    const resultCells: VerticalCell[] = resultDigits.map((d, idx) => ({
        val: "",
        isInput: true,
        id: `res-${idx}`
    }));

    rows.push({
        type: 'result',
        cells: resultCells
    });

    const config: VerticalGridConfig = {
        rows,
        maxLength: Math.max(aDigits.length, bDigits.length, resultDigits.length)
    };

    const expectedAnswers = resultDigits.map((d, idx) => ({
        id: `res-${idx}`,
        value: d
    }));

    return {
        id: `VM_${topicId}_${Date.now()}`,
        skillId: topicId,
        type: 'vertical-multiplication',
        difficultyLevel: difficulty,
        prompt: { text: "Fill in the missing numbers to complete the multiplication." },
        content: config,
        answerConfig: { expectedAnswers },
        explanation: {
            text: `Multiply ${a} by ${b}. ${a} × ${b} = ${total}.`
        }
    };
}

export function generateVerticalQuestion(topicId: string, difficulty: string = "medium", seed: number | null = null): Question {
    const random = new SeededRandom(seed || Date.now());
    
    // Generic fallback for the specific ID requested
    if (topicId === 'g4-mul-steps') return genVerticalMultiStep(random, difficulty, topicId);

    throw new Error("Unknown vertical topic: " + topicId);
}