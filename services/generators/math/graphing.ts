import { SeededRandom } from '../../../utils/SeededRandom';
import { Question, GraphConfig } from '../../../types';

function graphingTemplate({ topicId, prompt, graphConfig, explanation }: any): Question {
  return {
    id: `GRAPH_${topicId}_${Date.now()}`,
    skillId: topicId,
    type: 'graphing',
    prompt: { text: prompt },
    graphConfig,
    correctAnswer: "See graph",
    explanation
  };
}

export function generateGraphingQuestion(topicId: string, difficulty: string = "medium", seed: number | null = null): Question {
  const random = new SeededRandom(seed || Date.now());

  // Default Config
  const config: GraphConfig = {
    xRange: [-10, 10],
    yRange: [-10, 10],
    gridStep: 1,
    targetType: 'point',
    correctPoints: []
  };

  if (topicId === 'g5-graph-points') {
      // Difficulty: Easy = Quadrant 1 (0 to 10), Hard = 4 Quadrants (-10 to 10)
      const isHard = difficulty === 'hard';
      const min = isHard ? -9 : 0;
      const max = 9;

      const x = random.int(min, max);
      const y = random.int(min, max);
      
      config.correctPoints = [{ x, y }];
      
      return graphingTemplate({
          topicId,
          prompt: `Plot the point (${x}, ${y}) on the coordinate plane.`,
          graphConfig: config,
          explanation: {
              text: `To plot the point (${x}, ${y}):
1. Start at the origin (0,0).
2. Move ${Math.abs(x)} units ${x >= 0 ? 'right' : 'left'} along the x-axis.
3. Move ${Math.abs(y)} units ${y >= 0 ? 'up' : 'down'} along the y-axis.
4. Place a point at that location.`
          }
      });
  }

  throw new Error("Unknown graphing topic: " + topicId);
}
