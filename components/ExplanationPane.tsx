'use client';

import React from 'react';
import { Question } from '../types';
import { Lightbulb, ArrowRight } from 'lucide-react';

interface ExplanationPaneProps {
  question: Question;
  userAnswer: string;
  onClose: () => void;
}

export const ExplanationPane: React.FC<ExplanationPaneProps> = ({
  question,
  userAnswer,
  onClose,
}) => {
  return (
    <div className="bg-yellow-50 border-t-4 border-[#f5a623] p-6 md:p-8 rounded-b-lg shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-start gap-4 mb-6">
        <div className="bg-white p-2 rounded-full shadow-sm shrink-0">
          <Lightbulb className="w-6 h-6 text-[#f5a623]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Sorry, incorrect...
          </h3>
          <div className="space-y-1 text-gray-700">
            {question.type === 'sorting' ? (
                // Sorting specific feedback header
                <p className="font-semibold text-sm text-gray-500 uppercase tracking-wide">
                    Review the correct order below
                </p>
            ) : (
                <>
                <p className="font-semibold text-sm text-gray-500 uppercase tracking-wide">
                  The correct answer is:
                </p>
                <p className="text-xl font-bold text-gray-900 mb-4">
                  {question.correctAnswer}
                </p>
                <p className="font-semibold text-sm text-gray-500 uppercase tracking-wide mt-4">
                  You answered:
                </p>
                <p className="text-lg text-red-600 font-medium line-through decoration-2">
                  {userAnswer}
                </p>
                </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h4 className="text-lg font-bold text-[#0074e8] mb-4 border-b border-gray-100 pb-2">
          Explanation
        </h4>
        <div className="space-y-4">
          {question.explanation.text && (
            <p className="text-gray-700 leading-relaxed text-lg">
                {question.explanation.text}
            </p>
          )}
          {question.explanation.steps && question.explanation.steps.map((step, idx) => (
            <div key={idx} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-[#0074e8] font-bold rounded-full text-xs">
                {idx + 1}
              </span>
              <p className="text-gray-700 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onClose}
          className="flex items-center gap-2 bg-[#f5a623] hover:bg-orange-600 text-white px-6 py-3 rounded-md font-bold shadow-md transition-colors text-lg"
        >
          Got it
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};