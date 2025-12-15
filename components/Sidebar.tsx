'use client';

import React, { useEffect, useState } from 'react';
import { Award, Clock, Hash } from 'lucide-react';

interface SidebarProps {
  score: number;
  questionCount: number;
  streak: number;
  sessionStartTime: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  score,
  questionCount,
  streak,
  sessionStartTime,
}) => {
  const [elapsed, setElapsed] = useState<string>("00:00");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.floor((now - sessionStartTime) / 1000);
      const min = Math.floor(diff / 60);
      const sec = diff % 60;
      setElapsed(
        `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionStartTime]);

  return (
    <aside className="w-full md:w-64 bg-white md:h-screen sticky top-0 md:border-r border-b md:border-b-0 border-gray-200 shadow-sm flex flex-row md:flex-col shrink-0 z-10">
      <div className="p-4 md:p-6 border-b border-gray-100 bg-[#56a700] text-white">
         <h1 className="text-xl font-bold tracking-tight">SkillMaster</h1>
         <p className="text-xs text-green-100 mt-1 uppercase font-medium tracking-wider">Math / Grade 5</p>
      </div>

      <div className="flex flex-row md:flex-col w-full divide-x md:divide-x-0 md:divide-y divide-gray-100">
        
        {/* Questions Answered */}
        <div className="flex-1 p-4 flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Hash className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Questions</span>
          </div>
          <span className="text-2xl font-bold text-gray-800">{questionCount}</span>
        </div>

        {/* Time Elapsed */}
        <div className="flex-1 p-4 flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Time</span>
          </div>
          <span className="text-2xl font-bold text-gray-800">{elapsed}</span>
        </div>

        {/* SmartScore */}
        <div className="flex-1 p-4 flex flex-col items-center md:items-start bg-blue-50/50 md:bg-transparent">
          <div className="flex items-center gap-2 text-[#f5a623] mb-1">
            <Award className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#f5a623]">SmartScore</span>
          </div>
          <span className="text-4xl font-extrabold text-[#f5a623]">{score}</span>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-2 hidden md:block">
            <div 
                className="h-full bg-[#f5a623] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>

      </div>

      {streak > 1 && (
         <div className="hidden md:flex p-4 mt-auto bg-gradient-to-r from-yellow-100 to-orange-100 m-4 rounded-lg items-center gap-3">
            <div className="bg-white p-2 rounded-full shadow-sm">
                <span className="text-xl">🔥</span>
            </div>
            <div>
                <p className="text-xs font-bold text-orange-800 uppercase">Streak</p>
                <p className="text-sm font-medium text-orange-900">You got {streak} in a row!</p>
            </div>
         </div>
      )}
    </aside>
  );
};