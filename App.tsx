'use client';

import React, { useState, useEffect } from 'react';
import Home from '@/app/page';
import CurriculumPage from '@/app/curriculum/[subject]/[gradeId]/page';
import QuizPage from '@/app/quiz/[skillId]/page';

// Simple URL pattern matcher
// Returns params if match, null otherwise
const matchPath = (pattern: string, path: string) => {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');
  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith('[')) {
      const key = patternParts[i].slice(1, -1);
      params[key] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
};

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleNav = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleNav);
    // Hook into our custom pushState from next-mock if needed, 
    // but popstate covers back/forward. 
    // We also need to listen to the custom notify from next-mock ideally,
    // or just rely on the fact that next-mock triggers listeners.
    // Let's rely on a polling or custom event for simplicity in this specific environment setup
    // if standard popstate isn't enough for pushState calls.
    const interval = setInterval(() => {
        if (window.location.pathname !== currentPath) {
            setCurrentPath(window.location.pathname);
        }
    }, 100);

    return () => {
        window.removeEventListener('popstate', handleNav);
        clearInterval(interval);
    };
  }, [currentPath]);

  // Route matching
  
  // 1. Home
  if (currentPath === '/' || currentPath === '') {
    return <Home />;
  }

  // 2. Curriculum: /curriculum/[subject]/[gradeId]
  const curriculumMatch = matchPath('/curriculum/[subject]/[gradeId]', currentPath);
  if (curriculumMatch) {
    return (
      <CurriculumPage 
        params={{ 
          subject: curriculumMatch.subject, 
          gradeId: curriculumMatch.gradeId 
        }} 
      />
    );
  }

  // 3. Quiz: /quiz/[skillId]
  const quizMatch = matchPath('/quiz/[skillId]', currentPath);
  if (quizMatch) {
    return (
        <QuizPage 
            params={{
                skillId: quizMatch.skillId
            }}
        />
    );
  }
  
  // 4. Admin (Mock stub)
  if (currentPath.startsWith('/admin')) {
      return <div className="p-8 text-center">Admin panel not available in preview mode. <a href="/" className="text-blue-600 underline">Go Home</a></div>;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 flex-col gap-4">
      <h1 className="text-4xl font-bold text-gray-800">404</h1>
      <p className="text-gray-600">Page not found</p>
      <a href="/" className="text-blue-500 hover:underline" onClick={(e) => {
          e.preventDefault();
          window.history.pushState({}, '', '/');
      }}>Return Home</a>
    </div>
  );
}
