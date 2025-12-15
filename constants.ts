
import { LessonData, GradeData, Subject, SkillData, CategoryData } from './types';

// The "Real" playable skill (Mock fallback)
const EQUIVALENT_FRACTIONS_SKILL: SkillData = {
  skillId: "M.5.3",
  displayName: "Equivalent Fractions",
  description: "Find fractions that are equivalent to the given shape or number.",
  questions: [
    {
      id: "q_101",
      skillId: "M.5.3",
      difficultyLevel: "1",
      type: 'multiple-choice',
      prompt: {
        text: "Which fraction is equivalent to the shaded area?",
        image: "https://picsum.photos/300/200?random=1"
      },
      options: [
        { id: "A", content: "2/4", isCorrect: true },
        { id: "B", content: "1/3", isCorrect: false },
        { id: "C", content: "3/5", isCorrect: false },
        { id: "D", content: "1/5", isCorrect: false }
      ],
      correctAnswer: "2/4",
      explanation: {
        steps: [
          "Count the total number of parts in the circle. Assume there are 2 main parts visually.",
          "Count the shaded parts. There is 1 shaded part.",
          "The fraction is 1/2.",
          "Look at the options. 2/4 reduces to 1/2 (divide top and bottom by 2).",
          "Therefore, 2/4 is equivalent."
        ]
      }
    }
  ]
};

export const SUBJECTS: Subject[] = ['Math', 'Language Arts', 'Science', 'Social Studies'];

export const GRADES = [
  { id: '1', label: 'First grade' },
  { id: '2', label: 'Second grade' },
  { id: '3', label: 'Third grade' },
  { id: '4', label: 'Fourth grade' },
  { id: '5', label: 'Fifth grade' },
];

export const getCurriculumForGrade = (gradeId: string, subject: Subject): CategoryData[] => {
  if (subject === 'Math') {
      if (gradeId === '1') {
          return [
              { name: "A. Addition", skills: [
                  { skillId: "g1-add-pictures", displayName: "Add with pictures", description: "Use pictures to add numbers." },
                  { skillId: "g1-add-single-digit", displayName: "Add single digits", description: "Add two single-digit numbers." },
                  { skillId: "g1-add-making-10", displayName: "Making 10", description: "Find the missing number to make 10." },
                  { skillId: "g1-add-word", displayName: "Addition word problems", description: "Solve simple addition word problems." }
              ]},
              { name: "N. Numbers", skills: [
                  { skillId: "npv-number-recognition", displayName: "Number Recognition", description: "Identify numbers." },
                  { skillId: "npv-counting-forward", displayName: "Counting Forward", description: "Continue the sequence." },
                  { skillId: "g1-order-numbers", displayName: "Order Numbers", description: "Arrange numbers from least to greatest." },
                  { skillId: "nl-find-integer", displayName: "Find Numbers", description: "Locate numbers on a number line." }
              ]}
          ];
      }
      if (gradeId === '2') {
          return [
              { name: "A. Addition", skills: [
                  { skillId: "g2-add-single-digit", displayName: "Add one-digit numbers", description: "Add single digit numbers." },
                  { skillId: "g2-add-2digit-1digit", displayName: "Add 2-digit and 1-digit", description: "Add a two-digit number and a one-digit number." },
                  { skillId: "g2-add-two-2digit", displayName: "Add two 2-digit numbers", description: "Add two two-digit numbers without regrouping." }
              ]},
              { name: "C. Categorization", skills: [
                  { skillId: "g2-even-odd-drag", displayName: "Sort Even and Odd", description: "Drag numbers to the correct group." },
                  { skillId: "nl-select-odd", displayName: "Odd Numbers", description: "Identify odd numbers on a number line." }
              ]},
              { name: "M. Multiplication", skills: [
                  { skillId: "g2-mul-tables", displayName: "Times tables", description: "Introduction to multiplication tables." },
                  { skillId: "g2-mul-word", displayName: "Multiplication word problems", description: "Simple multiplication scenarios." }
              ]}
          ];
      }
      if (gradeId === '3') {
          return [
              { name: "M. Multiplication", skills: [
                  { skillId: "g3-mul-repeated-addition", displayName: "Repeated Addition", description: "Relate addition to multiplication." },
                  { skillId: "g3-mul-tables", displayName: "Multiplication Facts", description: "Practice times tables up to 12." },
                  { skillId: "g3-mul-numbers", displayName: "Multiply numbers", description: "Multiply larger numbers." },
                  { skillId: "g3-mul-properties", displayName: "Properties", description: "Commutative, Associative, and Distributive properties." }
              ]},
              { name: "B. Addition", skills: [
                   { skillId: "g3-add-3digit-3digit", displayName: "Add 3-digit numbers", description: "Add two 3-digit numbers." },
                   { skillId: "g3-add-estimate", displayName: "Estimate sums", description: "Round and add." }
              ]},
              { name: "O. Ordering", skills: [
                  { skillId: "g3-order-decimals", displayName: "Order Decimals", description: "Arrange decimals from least to greatest." }
              ]}
          ];
      }
      if (gradeId === '4') {
          return [
              { name: "M. Multiplication", skills: [
                  { skillId: "g4-mul-tables", displayName: "Multiplication facts", description: "Master multiplication facts." },
                  { skillId: "g4-mul-numbers", displayName: "Multiply 1-digit by 2-digit", description: "Multiply larger numbers." },
                  { skillId: "g4-mul-steps", displayName: "Vertical Multiplication", description: "Solve step-by-step multiplication problems." }
              ]},
              { name: "B. Addition", skills: [
                   { skillId: "g4-add-multi-digit", displayName: "Add multi-digit numbers", description: "Add numbers with 4 or more digits." }
              ]},
              { name: "O. Ordering", skills: [
                   { skillId: "g4-order-numbers-large", displayName: "Order Large Numbers", description: "Sort numbers up to 1,000." },
                   { skillId: "g4-order-fractions-like", displayName: "Order Fractions (Like)", description: "Sort fractions with same denominators." }
              ]}
          ];
      }
      if (gradeId === '5') {
          return [
              { name: "D. Decimals", skills: [
                  { skillId: "g5-add-decimal", displayName: "Add decimals", description: "Add decimal numbers." }
              ]},
              { name: "F. Fractions", skills: [
                  { skillId: "g5-add-fractions-like", displayName: "Add fractions", description: "Add fractions with like denominators." }
              ]},
              { name: "M. Multiplication", skills: [
                   { skillId: "g5-mul-numbers", displayName: "Multiply multi-digit numbers", description: "Challenge zone multiplication." }
              ]},
              { name: "O. Ordering", skills: [
                   { skillId: "g5-order-fractions-unlike", displayName: "Order Fractions (Unlike)", description: "Sort fractions with different denominators." },
                   { skillId: "g6-order-integers", displayName: "Order Integers", description: "Sort positive and negative numbers." }
              ]},
              { name: "P. Coordinate Plane", skills: [
                   { skillId: "geo-plot-points", displayName: "Graph points", description: "Plot coordinate points on a grid." }
              ]}
          ];
      }
  }

  // Fallback
  return [
    {
      name: "G. General Practice",
      skills: [EQUIVALENT_FRACTIONS_SKILL]
    }
  ];
};
