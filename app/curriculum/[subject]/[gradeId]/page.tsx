'use client';

import React from 'react';
import { Link } from '@/lib/next-mock';
import { Subject } from '@/types';
import { ChevronRight, ArrowLeft, Star } from 'lucide-react';
import { getCurriculumForGrade, GRADES } from '@/constants';

interface PageProps {
  params: {
    subject: string;
    gradeId: string;
  };
}

export default function CurriculumPage({ params }: PageProps) {
  const subjectStr = decodeURIComponent(params.subject);
  const subject = subjectStr as Subject;
  const { gradeId } = params;

  // Mock Data Fetching (Direct from Constants for Preview)
  const categories = getCurriculumForGrade(gradeId, subject);
  const gradeLabel = GRADES.find(g => g.id === gradeId)?.label || gradeId;
  
  const curriculumData = {
      gradeLabel,
      categories
  };

  return (
    <div className="min-h-screen bg-[#f3f9f9] font-sans">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link 
            href="/"
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{subject}</span>
             <span className="font-bold text-gray-800">{curriculumData.gradeLabel} Curriculum</span>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="space-y-8">
          {curriculumData.categories.map((category: any) => (
            <div key={category.name} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[#0074e8] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                   {category.name.charAt(0)}
                </div>
                <h2 className="font-bold text-gray-800 text-lg">
                    {category.name.substring(3)}
                </h2>
              </div>
              
              <div className="divide-y divide-gray-100">
                {category.skills.map((skill: any) => (
                  <Link
                    key={skill.skillId}
                    // Passing metadata via URL query params to Quiz Page. Using displayName.
                    href={`/quiz/${skill.skillId}?subject=${encodeURIComponent(subject)}&gradeLabel=${encodeURIComponent(gradeLabel)}&name=${encodeURIComponent(skill.displayName)}&desc=${encodeURIComponent(skill.description)}`}
                    className="w-full text-left px-6 py-4 hover:bg-blue-50 transition-colors group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-gray-400 w-12 group-hover:text-[#0074e8] transition-colors">
                        {skill.skillId}
                      </span>
                      <span className="text-gray-700 font-medium group-hover:text-[#0074e8] group-hover:underline decoration-2 underline-offset-2 transition-colors">
                        {skill.displayName}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-bold text-[#f5a623] bg-orange-50 px-2 py-1 rounded border border-orange-100 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-[#f5a623]" />
                            Start
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#0074e8]" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
