'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, LayoutDashboard, Loader2, ArrowLeft, Database } from 'lucide-react';
import { ICurriculum } from '@/models/Curriculum';

export default function AdminDashboard() {
  const [curricula, setCurricula] = useState<ICurriculum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurricula();
  }, []);

  const fetchCurricula = async () => {
    try {
      const res = await fetch('/api/curriculum');
      const data = await res.json();
      setCurricula(data);
    } catch (error) {
      console.error('Failed to fetch curricula', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    if (!confirm('Are you sure? This will delete all existing data and reset the database to the default seed data.')) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/seed');
      if (!res.ok) throw new Error('Seeding failed');
      
      const data = await res.json();
      alert(`Database seeded successfully!\nQuestions: ${data.stats.questionsCreated}\nCurricula: ${data.stats.curriculumRecords}`);
      
      // Refresh list
      await fetchCurricula();
    } catch (error) {
      console.error(error);
      alert('Failed to seed database.');
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this curriculum? This cannot be undone.')) return;
    
    try {
      await fetch(`/api/curriculum/${id}`, { method: 'DELETE' });
      setCurricula(prev => prev.filter(c => (c as any)._id !== id));
    } catch (error) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f9f9] font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
             <Link href="/" className="text-gray-500 hover:text-blue-600 flex items-center gap-1 text-sm font-bold uppercase tracking-wider mb-2">
                <ArrowLeft className="w-4 h-4" /> Back to App
             </Link>
             <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
                <LayoutDashboard className="w-8 h-8 text-[#0074e8]" />
                Curriculum Manager
             </h1>
             <p className="text-gray-600 mt-1">Manage subjects, grades, categories, and skills.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
                onClick={handleSeed}
                disabled={loading}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-5 py-3 rounded-lg font-bold shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
                <Database className="w-5 h-5" />
                Seed Database
            </button>
            <Link 
                href="/admin/curriculum/new"
                className="bg-[#56a700] hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-md flex items-center gap-2 transition-colors"
            >
                <Plus className="w-5 h-5" />
                Add New Curriculum
            </Link>
          </div>
        </div>

        {loading ? (
           <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 text-[#0074e8] animate-spin" />
           </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                    <th className="px-6 py-4 font-bold text-gray-600 uppercase text-xs tracking-wider">Subject</th>
                    <th className="px-6 py-4 font-bold text-gray-600 uppercase text-xs tracking-wider">Grade ID</th>
                    <th className="px-6 py-4 font-bold text-gray-600 uppercase text-xs tracking-wider">Grade Label</th>
                    <th className="px-6 py-4 font-bold text-gray-600 uppercase text-xs tracking-wider">Categories</th>
                    <th className="px-6 py-4 font-bold text-gray-600 uppercase text-xs tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {curricula.map((item: any) => (
                    <tr key={item._id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-800">
                           <span className={`
                              inline-block px-2 py-1 rounded text-xs font-bold uppercase tracking-wide
                              ${item.subject === 'Math' ? 'bg-blue-100 text-blue-800' : ''}
                              ${item.subject === 'Language Arts' ? 'bg-yellow-100 text-yellow-800' : ''}
                              ${item.subject === 'Science' ? 'bg-green-100 text-green-800' : ''}
                              ${item.subject === 'Social Studies' ? 'bg-purple-100 text-purple-800' : ''}
                           `}>
                              {item.subject}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{item.gradeId}</td>
                        <td className="px-6 py-4 text-gray-800 font-semibold">{item.gradeLabel}</td>
                        <td className="px-6 py-4 text-gray-500">{item.categories?.length || 0} Categories</td>
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <Link 
                            href={`/admin/curriculum/${item._id}`}
                            className="p-2 text-gray-400 hover:text-[#0074e8] hover:bg-blue-50 rounded transition-colors"
                        >
                            <Edit className="w-5 h-5" />
                        </Link>
                        <button 
                            onClick={() => handleDelete(item._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        </td>
                    </tr>
                    ))}
                    {curricula.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500">
                                No curriculum data found. Click "Seed Database" to load sample data.
                            </td>
                        </tr>
                    )}
                </tbody>
                </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}