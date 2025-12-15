'use client';

import React, { useState } from 'react';
import { Link } from '@/lib/next-mock';
import { SUBJECTS, GRADES } from '@/constants';
import { Subject } from '@/types';
import { BookOpen, GraduationCap, FlaskConical, Globe2, LockKeyhole } from 'lucide-react';

export default function Home() {
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Math');

  const getIconForSubject = (s: Subject) => {
    switch (s) {
      case 'Math': return <GraduationCap className="w-5 h-5" />;
      case 'Language Arts': return <BookOpen className="w-5 h-5" />;
      case 'Science': return <FlaskConical className="w-5 h-5" />;
      case 'Social Studies': return <Globe2 className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f9f9] font-sans flex flex-col">
      {/* Header */}
      <header className="bg-[#56a700] text-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded">
              <span className="text-xl font-bold tracking-tight">SkillMaster</span>
            </div>
            <span className="text-sm font-medium opacity-90 hidden sm:block">Adaptive Learning Platform</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 flex-1 w-full">
        {/* Subject Tabs */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-8 justify-center">
          {SUBJECTS.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold transition-all
                ${
                  selectedSubject === sub
                    ? 'bg-[#0074e8] text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }
              `}
            >
              {getIconForSubject(sub)}
              {sub}
            </button>
          ))}
        </div>

        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-3">
            {selectedSubject}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select a grade level to view the full curriculum and start practicing skills tailored to your learning journey.
          </p>
        </div>

        {/* Grades Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {GRADES.map((grade) => (
            <Link
              key={grade.id}
              href={`/curriculum/${encodeURIComponent(selectedSubject)}/${grade.id}`}
              className="
                group relative bg-white border-2 border-transparent hover:border-[#0074e8]
                rounded-xl shadow-sm hover:shadow-xl transition-all duration-200
                p-6 flex flex-col items-center justify-center gap-3 text-center
                overflow-hidden
              "
            >
              <div className="
                w-16 h-16 rounded-full bg-blue-50 text-[#0074e8]
                flex items-center justify-center text-2xl font-bold
                group-hover:bg-[#0074e8] group-hover:text-white transition-colors
              ">
                {grade.id}
              </div>
              <span className="text-gray-800 font-semibold group-hover:text-[#0074e8]">
                {grade.label}
              </span>
              
              {/* Decorative accent */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100 group-hover:bg-[#f5a623] transition-colors" />
            </Link>
          ))}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12 py-8 text-center text-gray-500">
        <p className="mb-4">© 2024 SkillMaster Learning. All rights reserved.</p>
        <div className="flex items-center justify-center gap-1 opacity-50 cursor-not-allowed">
            <LockKeyhole className="w-3 h-3" /> Admin Dashboard (Disabled in Preview)
        </div>
      </footer>
    </div>
  );
}
