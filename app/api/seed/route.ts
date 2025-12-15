import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Curriculum from '@/models/Curriculum';
import Question from '@/models/Question';
import { getCurriculumForGrade, GRADES, SUBJECTS } from '@/constants';

const SAMPLE_QUESTIONS = [
  {
    "id": "NL_nl-find-integer_1765790443637",
    "skillId": "nl-find-integer",
    "type": "number-line",
    "difficultyLevel": "medium",
    "prompt": {
        "text": "Locate the number 4 on the number line."
    },
    "explanation": {
        "text": "4 is located at the specific mark on the line."
    },
    "numberLineConfig": {
        "min": 0,
        "max": 10,
        "step": 1,
        "correctValue": 4,
        "labels": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    }
  }, 
  {
    "id": "MATH_MUL_WORD_G2_1765790497650",
    "skillId": "g2-mul-word",
    "type": "multiple-choice",
    "prompt": {
        "text": "A bus makes 5 trips and carries 2 passengers each time. How many passengers in all?"
    },
    "options": [
        { "id": "A", "content": "5 passengers", "isCorrect": false },
        { "id": "B", "content": "10 passengers", "isCorrect": true },
        { "id": "C", "content": "12 passengers", "isCorrect": false },
        { "id": "D", "content": "7 passengers", "isCorrect": false }
    ],
    "correctAnswer": "10 passengers",
    "explanation": {
        "text": "We have 5 groups of 2 passengers. So we multiply: 5 × 2 = 10 passengers."
    }
  }, 
  {
    "id": "NL_OE_1765790541812",
    "skillId": "nl-select-odd",
    "type": "number-line",
    "difficultyLevel": "medium",
    "prompt": {
        "text": "Select all the odd numbers on the number line."
    },
    "explanation": {
        "text": "Odd numbers end in 1, 3, 5, 7, or 9."
    },
    "numberLineConfig": {
        "min": 18,
        "max": 28,
        "step": 1,
        "correctValue": null,
        "correctValues": [19, 21, 23, 25, 27],
        "labels": [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
        "interactionType": "multi-select"
    }
  }, 
  {
    "id": "FIB_fib-equation_1765790615773",
    "skillId": "g1-add-making-10",
    "type": "fill-in-blank",
    "difficultyLevel": "medium",
    "prompt": {
        "text": "Fill in the missing number:"
    },
    "content": {
        "prompt": "Fill in the missing number:",
        "instructions": "Fill in the missing values.",
        "stimulus": {
            "type": "text",
            "content": "8 + [blank1] = 23"
        },
        "blanks": [
            { "id": "blank1", "length": 2, "correctAnswer": "15" }
        ]
    },
    "answerConfig": {
        "expectedAnswers": [
            { "id": "blank1", "value": 15 }
        ]
    },
    "explanation": {
        "text": "Subtract the known part from the total to find the missing part."
    }
  }, 
  {
    "id": "SORT_g1-order-numbers_1765790666805",
    "skillId": "g1-order-numbers",
    "type": "sorting",
    "prompt": {
        "text": "Arrange these numbers from least to greatest."
    },
    "items": [
        { "id": "item-25", "content": "25" },
        { "id": "item-44", "content": "44" },
        { "id": "item-38", "content": "38" },
        { "id": "item-82", "content": "82" }
    ],
    "correctOrder": ["item-25", "item-38", "item-44", "item-82"],
    "correctAnswer": "See correct order below",
    "explanation": {
        "text": "The items should be arranged in the following order:",
        "steps": ["25", "38", "44", "82"]
    }
  }, 
  {
    "id": "GEO_geo-plot-points_1765790694737",
    "skillId": "geo-plot-points",
    "type": "graphing",
    "difficultyLevel": "medium",
    "prompt": {
        "text": "Plot the following points on the coordinate plane: (-8, 1) and (4, -3)."
    },
    "explanation": {
        "text": "For (-8, 1), start at the origin. Move 8 units left and 1 units up. Repeat for the second point."
    },
    "graphConfig": {
        "xRange": [-10, 10],
        "yRange": [-10, 10],
        "gridStep": 1,
        "targetType": "point",
        "correctPoints": [
            { "x": -8, "y": 1 },
            { "x": 4, "y": -3 }
        ]
    }
  }, 
  {
    "id": "FIB_mul-pattern-powers_1765790725278",
    "skillId": "g3-mul-repeated-addition",
    "type": "fill-in-blank",
    "prompt": {
        "text": "Complete the pattern:"
    },
    "content": {
        "prompt": "Complete the pattern:",
        "instructions": "Fill each blank with the correct number.",
        "stimulus": {
            "type": "text",
            "content": "[blank1] × 4 = 12\n[blank2] × 40 = 120\n[blank3] × 400 = 1,200\n[blank4] × 4,000 = 12,000"
        },
        "blanks": [
            { "id": "blank1", "position": 0, "length": 1, "correctAnswer": "3" },
            { "id": "blank2", "position": 1, "length": 1, "correctAnswer": "3" },
            { "id": "blank3", "position": 2, "length": 1, "correctAnswer": "3" },
            { "id": "blank4", "position": 3, "length": 1, "correctAnswer": "3" }
        ]
    },
    "answerConfig": {
        "expectedAnswers": [
            { "id": "blank1", "value": 3 },
            { "id": "blank2", "value": 3 },
            { "id": "blank3", "value": 3 },
            { "id": "blank4", "value": 3 }
        ]
    },
    "explanation": {
        "text": "Notice how the answer grows by adding a zero each time? That's the power of 10! When you multiply by 10, the digit moves one place to the left."
    }
  },  
  {
    "id": "VM_STEP_1765790751342",
    "skillId": "g4-mul-steps",
    "type": "vertical-multiplication",
    "difficultyLevel": "medium",
    "prompt": {
        "text": "Fill in the missing numbers to complete the multiplication."
    },
    "content": {
        "rows": [
            {
                "type": "factor",
                "cells": [
                    { "val": "5", "isInput": false },
                    { "val": "2", "isInput": false }
                ]
            },
            {
                "type": "factor-operator",
                "operator": "×",
                "cells": [
                    { "val": "2", "isInput": false },
                    { "val": "8", "isInput": false }
                ]
            },
            {
                "type": "partial",
                "cells": [
                    { "val": "4", "isInput": false },
                    { "val": "1", "isInput": false },
                    { "val": "6", "isInput": false }
                ]
            },
            {
                "type": "partial-operator",
                "operator": "+",
                "cells": [
                    { "val": "1", "isInput": false },
                    { "val": "0", "isInput": false },
                    { "val": "4", "isInput": false },
                    { "val": "0", "isInput": false }
                ]
            },
            {
                "type": "result",
                "cells": [
                    { "val": "", "isInput": true, "id": "res-0" },
                    { "val": "", "isInput": true, "id": "res-1" },
                    { "val": "", "isInput": true, "id": "res-2" },
                    { "val": "", "isInput": true, "id": "res-3" }
                ]
            }
        ],
        "maxLength": 6
    },
    "answerConfig": {
        "expectedAnswers": [
            { "id": "res-0", "value": "1" },
            { "id": "res-1", "value": "4" },
            { "id": "res-2", "value": "5" },
            { "id": "res-3", "value": "6" }
        ]
    },
    "explanation": {
        "text": "Multiply the top number by the ones digit, then by the tens digit (don't forget the placeholder zero!), then add the partial products.",
        "steps": [
            "52 × 8 = 416",
            "52 × 20 = 1040",
            "416 + 1040 = 1456"
        ]
    }
  }
];

export async function GET() {
  try {
    await connectDB();

    // 1. Seed Curriculum
    await Curriculum.deleteMany({});
    let curriculumCount = 0;
    for (const subject of SUBJECTS) {
      for (const grade of GRADES) {
        const categories = getCurriculumForGrade(grade.id, subject);
        await Curriculum.create({
          subject,
          gradeId: grade.id,
          gradeLabel: grade.label,
          categories: categories,
        });
        curriculumCount++;
      }
    }

    // 2. Seed Questions
    await Question.deleteMany({});
    await Question.insertMany(SAMPLE_QUESTIONS);

    return NextResponse.json({ 
      message: 'Database seeded successfully', 
      stats: {
        curriculumRecords: curriculumCount,
        questionsCreated: SAMPLE_QUESTIONS.length
      }
    });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}