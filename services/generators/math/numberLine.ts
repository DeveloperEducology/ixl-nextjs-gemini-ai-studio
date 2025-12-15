
import { SeededRandom } from '../../../utils/SeededRandom';
import { Question, NumberLineConfig } from '../../../types';

function numberLineTemplate({ topicId, prompt, config, explanation }: any): Question {
  return {
    id: `NL_${topicId}_${Date.now()}`,
    skillId: topicId,
    type: 'number-line',
    difficultyLevel: 'medium',
    prompt: { text: prompt },
    explanation,
    numberLineConfig: config
  };
}

// 1. Find Integer (Single point)
function genFindInteger(random: SeededRandom, difficulty: string, topicId: string) {
    const rangeSize = difficulty === 'easy' ? 10 : 20;
    const start = random.int(0, 50);
    const end = start + rangeSize;
    const target = random.int(start + 1, end - 1);
    
    const labels = [];
    for(let i=start; i<=end; i++) labels.push(i);

    return numberLineTemplate({
        topicId,
        prompt: `Locate the number ${target} on the number line.`,
        config: {
            min: start,
            max: end,
            step: 1,
            correctValue: target,
            labels
        },
        explanation: {
            text: `${target} is located at the mark labeled ${target}.`
        }
    });
}

// 2. Select Odds (Multi-select)
function genSelectOdd(random: SeededRandom, difficulty: string, topicId: string) {
    const rangeSize = 10;
    const start = random.int(10, 30);
    const end = start + rangeSize;
    
    const labels = [];
    const correctValues = [];
    
    for(let i=start; i<=end; i++) {
        labels.push(i);
        if (i % 2 !== 0) correctValues.push(i);
    }

    return numberLineTemplate({
        topicId,
        prompt: "Select all the odd numbers on the number line.",
        config: {
            min: start,
            max: end,
            step: 1,
            correctValues: correctValues,
            labels,
            interactionType: 'multi-select'
        },
        explanation: {
            text: "Odd numbers end in 1, 3, 5, 7, or 9."
        }
    });
}

export function generateNumberLineQuestion(topicId: string, difficulty: string = "medium", seed: number | null = null): Question {
  const random = new SeededRandom(seed || Date.now());

  if (topicId === 'nl-find-integer') return genFindInteger(random, difficulty, topicId);
  if (topicId === 'nl-select-odd') return genSelectOdd(random, difficulty, topicId);

  throw new Error("Unknown number line topic: " + topicId);
}
