'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, X, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { Subject } from '@/types';

// Simplified types for the form state
interface SkillForm {
  id: string;
  name: string;
  description: string;
}

interface CategoryForm {
  name: string;
  skills: SkillForm[];
}

interface CurriculumForm {
  _id?: string;
  subject: Subject;
  gradeId: string;
  gradeLabel: string;
  categories: CategoryForm[];
}

const DEFAULT_FORM: CurriculumForm = {
  subject: 'Math',
  gradeId: '',
  gradeLabel: '',
  categories: []
};

export default function EditCurriculumPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isNew = params.id === 'new';
  
  const [formData, setFormData] = useState<CurriculumForm>(DEFAULT_FORM);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

  useEffect(() => {
    if (!isNew) {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/curriculum/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setFormData(data);
      // Expand all categories by default on load
      setExpandedCategories(data.categories.map((_: any, i: number) => i));
    } catch (error) {
      console.error(error);
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = isNew ? '/api/curriculum' : `/api/curriculum/${params.id}`;
      const method = isNew ? 'POST' : 'PUT';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save');
      
      router.push('/admin');
      router.refresh(); // Refresh server components if any
    } catch (error) {
      alert('Error saving curriculum');
      setSaving(false);
    }
  };

  // --- Form Helpers ---

  const addCategory = () => {
    const newIdx = formData.categories.length;
    setFormData({
      ...formData,
      categories: [...formData.categories, { name: 'New Category', skills: [] }]
    });
    setExpandedCategories([...expandedCategories, newIdx]);
  };

  const removeCategory = (idx: number) => {
    const newCats = [...formData.categories];
    newCats.splice(idx, 1);
    setFormData({ ...formData, categories: newCats });
  };

  const updateCategoryName = (idx: number, name: string) => {
    const newCats = [...formData.categories];
    newCats[idx].name = name;
    setFormData({ ...formData, categories: newCats });
  };

  const toggleCategory = (idx: number) => {
    if (expandedCategories.includes(idx)) {
      setExpandedCategories(expandedCategories.filter(i => i !== idx));
    } else {
      setExpandedCategories([...expandedCategories, idx]);
    }
  };

  const addSkill = (catIdx: number) => {
    const newCats = [...formData.categories];
    // Generate a temporary ID or blank
    newCats[catIdx].skills.push({ 
      id: `${formData.gradeId}-new-${Date.now().toString().slice(-4)}`, 
      name: '', 
      description: '' 
    });
    setFormData({ ...formData, categories: newCats });
  };

  const removeSkill = (catIdx: number, skillIdx: number) => {
    const newCats = [...formData.categories];
    newCats[catIdx].skills.splice(skillIdx, 1);
    setFormData({ ...formData, categories: newCats });
  };

  const updateSkill = (catIdx: number, skillIdx: number, field: keyof SkillForm, value: string) => {
    const newCats = [...formData.categories];
    newCats[catIdx].skills[skillIdx][field] = value;
    setFormData({ ...formData, categories: newCats });
  };

  if (loading) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-[#f3f9f9]">
            <Loader2 className="w-8 h-8 text-[#0074e8] animate-spin" />
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#f3f9f9] p-6 pb-24 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 sticky top-0 bg-[#f3f9f9] z-10 py-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
             <button onClick={() => router.back()} className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-500" />
             </button>
             <div>
                <h1 className="text-2xl font-extrabold text-gray-800">
                    {isNew ? 'Create Curriculum' : 'Edit Curriculum'}
                </h1>
                <p className="text-sm text-gray-500">
                    {isNew ? 'Setup a new grade level' : `Editing ${formData.gradeLabel} (${formData.subject})`}
                </p>
             </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#0074e8] hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>

        {/* Main Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
           <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">General Settings</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase mb-2">Subject</label>
                  <select 
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value as Subject})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#0074e8] outline-none"
                  >
                      {['Math', 'Language Arts', 'Science', 'Social Studies'].map(s => (
                          <option key={s} value={s}>{s}</option>
                      ))}
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase mb-2">Grade ID</label>
                  <input 
                    type="text" 
                    value={formData.gradeId}
                    onChange={e => setFormData({...formData, gradeId: e.target.value})}
                    placeholder="e.g. 5, K, 12"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#0074e8] outline-none"
                  />
              </div>
              <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase mb-2">Grade Label</label>
                  <input 
                    type="text" 
                    value={formData.gradeLabel}
                    onChange={e => setFormData({...formData, gradeLabel: e.target.value})}
                    placeholder="e.g. Fifth grade"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#0074e8] outline-none"
                  />
              </div>
           </div>
        </div>

        {/* Categories Section */}
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Categories & Skills</h2>
                <button 
                   onClick={addCategory}
                   className="text-[#0074e8] font-bold text-sm bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Category
                </button>
            </div>

            {formData.categories.map((category, catIdx) => {
                const isExpanded = expandedCategories.includes(catIdx);
                
                return (
                    <div key={catIdx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Category Header */}
                        <div className="bg-gray-50 p-4 flex items-center gap-4 border-b border-gray-200">
                             <button onClick={() => toggleCategory(catIdx)} className="text-gray-400 hover:text-gray-600">
                                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                             </button>
                             <div className="flex-1">
                                <input 
                                    type="text"
                                    value={category.name}
                                    onChange={(e) => updateCategoryName(catIdx, e.target.value)}
                                    placeholder="Category Name (e.g. M. Multiplication)"
                                    className="w-full bg-transparent border-none font-bold text-lg text-gray-800 placeholder-gray-400 focus:ring-0 px-0"
                                />
                             </div>
                             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-4">
                                {category.skills.length} Skills
                             </span>
                             <button 
                                onClick={() => removeCategory(catIdx)}
                                className="text-gray-300 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                             </button>
                        </div>

                        {/* Skills List */}
                        {isExpanded && (
                            <div className="p-4 bg-white">
                                <div className="space-y-3">
                                    {category.skills.map((skill, skillIdx) => (
                                        <div key={skillIdx} className="flex flex-col md:flex-row gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors group relative">
                                            <div className="md:w-1/4">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Skill ID</label>
                                                <input 
                                                    type="text" 
                                                    value={skill.id}
                                                    onChange={e => updateSkill(catIdx, skillIdx, 'id', e.target.value)}
                                                    className="w-full text-sm font-mono text-[#0074e8] bg-white border border-gray-200 rounded px-2 py-1"
                                                />
                                            </div>
                                            <div className="md:w-1/4">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Name</label>
                                                <input 
                                                    type="text" 
                                                    value={skill.name}
                                                    onChange={e => updateSkill(catIdx, skillIdx, 'name', e.target.value)}
                                                    className="w-full text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded px-2 py-1"
                                                />
                                            </div>
                                            <div className="md:w-1/2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
                                                <input 
                                                    type="text" 
                                                    value={skill.description}
                                                    onChange={e => updateSkill(catIdx, skillIdx, 'description', e.target.value)}
                                                    className="w-full text-sm text-gray-600 bg-white border border-gray-200 rounded px-2 py-1"
                                                />
                                            </div>
                                            
                                            <button 
                                                onClick={() => removeSkill(catIdx, skillIdx)}
                                                className="absolute -top-2 -right-2 bg-white border border-gray-200 shadow-sm rounded-full p-1 text-gray-400 hover:text-red-600 hover:border-red-200 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    
                                    <button 
                                        onClick={() => addSkill(catIdx)}
                                        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 font-bold text-sm hover:border-[#0074e8] hover:text-[#0074e8] hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Add Skill to "{category.name}"
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {formData.categories.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                    <p>No categories yet. Click "Add Category" to start building the curriculum.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}