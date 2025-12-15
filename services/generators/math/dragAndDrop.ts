
import { SeededRandom } from '../../../utils/SeededRandom';
import { Question, DragDropItem, DragDropZone } from '../../../types';

function dragDropTemplate({ topicId, prompt, items, zones, correctMapping, explanation }: any): Question {
  return {
    id: `DND_${topicId}_${Date.now()}`,
    skillId: topicId,
    type: 'drag-and-drop',
    prompt: { text: prompt },
    dragDropConfig: {
        items,
        zones,
        correctMapping
    },
    correctAnswer: "See correctly sorted items",
    explanation
  };
}

// 1. Even and Odd Numbers
function genEvenOddDrag(random: SeededRandom, difficulty: string, topicId: string) {
    const min = 1, max = difficulty === 'hard' ? 99 : 20;
    const count = 6;
    const items: DragDropItem[] = [];
    const correctMapping: Record<string, string> = {};

    const numbers = new Set<number>();
    while(numbers.size < count) {
        numbers.add(random.int(min, max));
    }

    const zones: DragDropZone[] = [
        { id: 'zone-even', label: 'Even Numbers' },
        { id: 'zone-odd', label: 'Odd Numbers' }
    ];

    Array.from(numbers).forEach(n => {
        const id = `item-${n}`;
        items.push({ id, content: n.toString() });
        correctMapping[id] = (n % 2 === 0) ? 'zone-even' : 'zone-odd';
    });

    return dragDropTemplate({
        topicId,
        prompt: "Sort the numbers into Even and Odd.",
        items,
        zones,
        correctMapping,
        explanation: {
            text: "Even numbers end in 0, 2, 4, 6, or 8. Odd numbers end in 1, 3, 5, 7, or 9."
        }
    });
}

export function generateDragDropQuestion(topicId: string, difficulty: string = "medium", seed: number | null = null): Question {
  const random = new SeededRandom(seed || Date.now());

  if (topicId === 'g2-even-odd-drag') {
      return genEvenOddDrag(random, difficulty, topicId);
  }

  throw new Error("Unknown drag and drop topic: " + topicId);
}
