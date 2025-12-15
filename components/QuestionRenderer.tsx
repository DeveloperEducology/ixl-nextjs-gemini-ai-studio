'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Question, SortingItem, GraphConfig, DragDropItem, NumberLineConfig, VerticalGridConfig } from '../types';
import { GripVertical, Move } from 'lucide-react';

interface QuestionRendererProps {
  question: Question;
  onAnswerSubmit: (answer: string) => void;
  isSubmitting: boolean;
  userPreviousAnswer: string | null;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  onAnswerSubmit,
  isSubmitting,
  userPreviousAnswer
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  
  // Sorting State
  const [sortableItems, setSortableItems] = useState<SortingItem[]>([]);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Fill in Blank / Vertical Grid State
  // Maps input ID to value
  const [fillBlankAnswers, setFillBlankAnswers] = useState<Record<string, string>>({});

  // Graphing State
  const [graphPoints, setGraphPoints] = useState<{x: number, y: number}[]>([]);

  // Drag and Drop State
  const [dragPlacements, setDragPlacements] = useState<Record<string, string>>({});

  // Number Line State
  const [numberLineSelection, setNumberLineSelection] = useState<number[]>([]);

  useEffect(() => {
    // Reset states on new question
    setSelectedOptionId('');
    setTextInput('');
    setFillBlankAnswers({});
    setGraphPoints([]);
    setDragPlacements({});
    setNumberLineSelection([]);
    
    if (question.type === 'sorting' && question.items) {
      setSortableItems([...question.items]);
    }
    
    if (question.type === 'drag-and-drop' && question.dragDropConfig) {
      const initialPlacements: Record<string, string> = {};
      question.dragDropConfig.items.forEach(item => {
        initialPlacements[item.id] = 'source';
      });
      setDragPlacements(initialPlacements);
    }
  }, [question.id, question.type, question.items, question.dragDropConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.type === 'multiple-choice') {
      const selected = question.options?.find(o => o.id === selectedOptionId);
      if (selected) onAnswerSubmit(selected.content);
    } else if (question.type === 'sorting') {
      const orderedIds = sortableItems.map(i => i.id);
      onAnswerSubmit(JSON.stringify(orderedIds));
    } else if (question.type === 'fill-in-blank' || question.type === 'vertical-multiplication') {
      onAnswerSubmit(JSON.stringify(fillBlankAnswers));
    } else if (question.type === 'graphing') {
      onAnswerSubmit(JSON.stringify(graphPoints));
    } else if (question.type === 'drag-and-drop') {
      const placed: Record<string, string> = {};
      Object.entries(dragPlacements).forEach(([itemId, zoneId]) => {
         if (zoneId !== 'source') placed[itemId] = zoneId;
      });
      onAnswerSubmit(JSON.stringify(placed));
    } else if (question.type === 'number-line') {
      onAnswerSubmit(JSON.stringify(numberLineSelection));
    } else {
      if (textInput.trim()) onAnswerSubmit(textInput);
    }
  };

  // --- Sorting Logic ---
  const handleSortDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    if (isSubmitting) return;
    dragItem.current = position;
    e.currentTarget.classList.add('opacity-50', 'scale-105');
  };

  const handleSortDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    if (isSubmitting) return;
    dragOverItem.current = position;
  };

  const handleSortDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50', 'scale-105');
    if (isSubmitting) return;

    if (dragItem.current !== null && dragOverItem.current !== null) {
        const copyListItems = [...sortableItems];
        const dragItemContent = copyListItems[dragItem.current];
        copyListItems.splice(dragItem.current, 1);
        copyListItems.splice(dragOverItem.current, 0, dragItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setSortableItems(copyListItems);
    }
  };

  // --- Drag and Drop Logic ---
  const handleDndDragStart = (e: React.DragEvent<HTMLDivElement>, itemId: string) => {
    if (isSubmitting) return;
    e.dataTransfer.setData('itemId', itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDndDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDndDrop = (e: React.DragEvent<HTMLDivElement>, zoneId: string) => {
    e.preventDefault();
    if (isSubmitting) return;
    const itemId = e.dataTransfer.getData('itemId');
    if (itemId) {
      setDragPlacements(prev => ({
        ...prev,
        [itemId]: zoneId
      }));
    }
  };

  // --- Graphing Logic ---
  const handleGraphClick = (e: React.MouseEvent<SVGSVGElement>, config: GraphConfig) => {
    if (isSubmitting) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const padding = 40;
    const width = 400;
    const height = 400;
    const graphW = width - 2 * padding;
    const graphH = height - 2 * padding;

    const [minX, maxX] = config.xRange;
    const [minY, maxY] = config.yRange;

    const rawX = ((clickX - padding) / graphW) * (maxX - minX) + minX;
    const rawY = maxY - ((clickY - padding) / graphH) * (maxY - minY);

    const step = config.gridStep || 1;
    const snappedX = Math.round(rawX / step) * step;
    const snappedY = Math.round(rawY / step) * step;

    if (snappedX < minX || snappedX > maxX || snappedY < minY || snappedY > maxY) return;

    setGraphPoints(prev => {
        const existsIdx = prev.findIndex(p => Math.abs(p.x - snappedX) < 0.001 && Math.abs(p.y - snappedY) < 0.001);
        if (existsIdx >= 0) {
            const newPoints = [...prev];
            newPoints.splice(existsIdx, 1);
            return newPoints;
        } else {
            if (config.targetType === 'line' && prev.length >= 2) return prev; 
            return [...prev, { x: snappedX, y: snappedY }];
        }
    });
  };
  
  // --- Number Line Logic ---
  const handleNumberLineClick = (val: number, isMulti: boolean) => {
      if (isSubmitting) return;
      
      setNumberLineSelection(prev => {
          if (isMulti) {
              if (prev.includes(val)) return prev.filter(v => v !== val);
              return [...prev, val];
          } else {
              return [val];
          }
      });
  };

  const isInteractionDisabled = isSubmitting;


  // --- RENDERERS ---

  // 1. Drag and Drop
  if (question.type === 'drag-and-drop' && question.dragDropConfig) {
      const { items, zones } = question.dragDropConfig;
      const sourceItems = items.filter(item => (dragPlacements[item.id] || 'source') === 'source');
      
      const renderDraggableItem = (item: DragDropItem) => (
        <div
          key={item.id}
          draggable={!isInteractionDisabled}
          onDragStart={(e) => handleDndDragStart(e, item.id)}
          className={`bg-white border-2 border-[#0074e8] text-[#0074e8] font-bold py-2 px-4 rounded-lg shadow-sm ${isInteractionDisabled ? 'cursor-default opacity-80' : 'cursor-grab hover:bg-blue-50 active:cursor-grabbing'} flex items-center gap-2`}
        >
          <Move className="w-4 h-4" /> {item.content}
        </div>
      );

      const allPlaced = Object.values(dragPlacements).filter(z => z !== 'source').length === items.length;

      return (
        <form onSubmit={handleSubmit} className="w-full max-w-4xl">
           <div className="flex flex-col gap-8">
              <div 
                className="bg-gray-100 p-4 rounded-xl border-2 border-dashed border-gray-300 min-h-[100px]"
                onDragOver={handleDndDragOver}
                onDrop={(e) => handleDndDrop(e, 'source')}
              >
                 <p className="text-gray-400 text-sm font-bold uppercase mb-2">Item Bank</p>
                 <div className="flex flex-wrap gap-3">
                    {sourceItems.map(renderDraggableItem)}
                    {sourceItems.length === 0 && <p className="text-gray-400 text-sm italic w-full text-center py-2">All items placed</p>}
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {zones.map(zone => {
                     const zoneItems = items.filter(item => dragPlacements[item.id] === zone.id);
                     return (
                        <div 
                            key={zone.id}
                            className={`rounded-xl p-4 border-2 transition-colors min-h-[160px] flex flex-col ${isInteractionDisabled ? 'border-gray-200 bg-gray-50' : 'border-blue-200 bg-blue-50/30 hover:border-blue-300'}`}
                            onDragOver={handleDndDragOver}
                            onDrop={(e) => handleDndDrop(e, zone.id)}
                        >
                            <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">{zone.label}</h3>
                            <div className="flex flex-col gap-2 flex-1">
                                {zoneItems.map(renderDraggableItem)}
                                {zoneItems.length === 0 && (
                                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                                        <p className="text-gray-400 text-sm">Drop here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                     );
                 })}
              </div>
           </div>
           <button type="submit" disabled={!allPlaced || isInteractionDisabled} className={`mt-8 px-8 py-3 rounded-md font-bold text-white text-lg shadow-sm transition-colors w-full md:w-auto ${(!allPlaced || isInteractionDisabled) ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#56a700] hover:bg-green-700'}`}>Submit</button>
        </form>
      );
  }

  // 2. Graphing
  if (question.type === 'graphing' && question.graphConfig) {
      const config = question.graphConfig;
      const padding = 40, width = 400, height = 400;
      const graphW = width - 2 * padding, graphH = height - 2 * padding;
      const [minX, maxX] = config.xRange;
      const [minY, maxY] = config.yRange;

      const scaleX = (val: number) => padding + (val - minX) / (maxX - minX) * graphW;
      const scaleY = (val: number) => padding + (maxY - val) / (maxY - minY) * graphH;

      const step = config.gridStep || 1;
      const gridLines = [];
      const labels = [];

      for (let x = minX; x <= maxX; x += step) {
          const xPos = scaleX(x);
          const isAxis = Math.abs(x) < 0.001;
          gridLines.push(<line key={`v${x}`} x1={xPos} y1={padding} x2={xPos} y2={height - padding} stroke={isAxis ? "#374151" : "#e5e7eb"} strokeWidth={isAxis ? 2 : 1} />);
          if (Math.abs(x % (step * 2)) < 0.001 && x !== 0) labels.push(<text key={`lx${x}`} x={xPos} y={height - padding + 20} textAnchor="middle" fontSize="12" fill="#6b7280">{Math.round(x)}</text>);
      }
      for (let y = minY; y <= maxY; y += step) {
          const yPos = scaleY(y);
          const isAxis = Math.abs(y) < 0.001;
          gridLines.push(<line key={`h${y}`} x1={padding} y1={yPos} x2={width - padding} y2={yPos} stroke={isAxis ? "#374151" : "#e5e7eb"} strokeWidth={isAxis ? 2 : 1} />);
          if (Math.abs(y % (step * 2)) < 0.001 && y !== 0) labels.push(<text key={`ly${y}`} x={padding - 10} y={yPos + 4} textAnchor="end" fontSize="12" fill="#6b7280">{Math.round(y)}</text>);
      }
      labels.push(<text key="zero" x={scaleX(0) - 8} y={scaleY(0) + 15} fontSize="12" fill="#374151">0</text>);

      const points = graphPoints.map((p, i) => (<circle key={i} cx={scaleX(p.x)} cy={scaleY(p.y)} r={6} fill="#0074e8" stroke="white" strokeWidth={2} />));

      let lineElement = null;
      if (config.targetType === 'line' && graphPoints.length === 2) {
          const p1 = graphPoints[0], p2 = graphPoints[1];
          const x1 = scaleX(p1.x), y1 = scaleY(p1.y);
          const dx = scaleX(p2.x) - x1, dy = scaleY(p2.y) - y1;
          if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
             const EXT = 1000;
             const m = dy/dx;
             lineElement = <line x1={x1 - EXT} y1={y1 - m * EXT} x2={x1 + EXT} y2={y1 + m * EXT} stroke="#0074e8" strokeWidth={3} />;
          }
      }

      return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-2 italic">{config.targetType === 'line' ? "Click two points to draw a line" : "Click to plot points"}</p>
            <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-sm">
                <svg width={width} height={height} onClick={(e) => handleGraphClick(e, config)} className={`${isInteractionDisabled ? 'cursor-default opacity-80' : 'cursor-crosshair'}`}>
                    <defs><clipPath id="graphClip"><rect x={padding} y={padding} width={graphW} height={graphH} /></clipPath></defs>
                    {gridLines}
                    {labels}
                    <g clipPath="url(#graphClip)">{lineElement}</g>
                    {points}
                </svg>
            </div>
            <button type="submit" disabled={graphPoints.length === 0 || isInteractionDisabled} className={`mt-6 px-8 py-3 rounded-md font-bold text-white text-lg shadow-sm transition-colors ${(graphPoints.length === 0 || isInteractionDisabled) ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#56a700] hover:bg-green-700'}`}>Submit</button>
        </form>
      );
  }

  // 3. Number Line
  if (question.type === 'number-line' && question.numberLineConfig) {
      const config = question.numberLineConfig;
      const padding = 50;
      const width = 600;
      const height = 150;
      const lineY = 75;
      const lineW = width - 2 * padding;
      
      const range = config.max - config.min;
      const scale = (val: number) => padding + ((val - config.min) / range) * lineW;
      
      const isMulti = config.interactionType === 'multi-select';
      const ticks = [];
      const labels = [];
      
      for (let i = config.min; i <= config.max; i += config.step) {
          const x = scale(i);
          ticks.push(<line key={`t${i}`} x1={x} y1={lineY - 10} x2={x} y2={lineY + 10} stroke="#374151" strokeWidth={2} />);
          
          if (config.labels && config.labels.includes(i)) {
              labels.push(
                  <text key={`l${i}`} x={x} y={lineY + 30} textAnchor="middle" fontSize="14" fill="#374151" fontWeight="bold">
                      {i}
                  </text>
              );
          }
          
          // Interaction Zone
          ticks.push(
              <rect 
                key={`zone${i}`} 
                x={x - 15} y={lineY - 40} width={30} height={80} 
                fill="transparent" 
                className={isInteractionDisabled ? '' : 'cursor-pointer hover:fill-blue-50/50'}
                onClick={() => handleNumberLineClick(i, isMulti)}
              />
          );
      }

      return (
        <form onSubmit={handleSubmit} className="w-full max-w-3xl flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-2 italic">{isMulti ? "Click values to select them" : "Click the value on the line"}</p>
            <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm overflow-x-auto w-full flex justify-center">
                <svg width={width} height={height}>
                    <line x1={padding} y1={lineY} x2={width - padding} y2={lineY} stroke="#374151" strokeWidth={3} />
                    {ticks}
                    {labels}
                    {numberLineSelection.map(val => (
                        <circle 
                            key={`sel${val}`} 
                            cx={scale(val)} cy={lineY} r={8} 
                            fill="#0074e8" 
                            stroke="white" strokeWidth={2} 
                            className="pointer-events-none"
                        />
                    ))}
                </svg>
            </div>
            <button 
                type="submit" 
                disabled={numberLineSelection.length === 0 || isInteractionDisabled} 
                className={`mt-6 px-8 py-3 rounded-md font-bold text-white text-lg shadow-sm transition-colors ${(numberLineSelection.length === 0 || isInteractionDisabled) ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#56a700] hover:bg-green-700'}`}
            >
                Submit
            </button>
        </form>
      );
  }

  // 4. Vertical Multiplication
  if (question.type === 'vertical-multiplication' && question.content) {
      const config = question.content as VerticalGridConfig;
      const allFieldsFilled = Object.keys(fillBlankAnswers).length >= (question.answerConfig?.expectedAnswers.length || 0);

      return (
        <form onSubmit={handleSubmit} className="w-full max-w-lg flex flex-col items-center">
             <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-2xl font-mono tracking-wider">
                 <div className="flex flex-col items-end">
                    {config.rows.map((row, rIdx) => (
                        <div key={rIdx} className={`flex items-center justify-end w-full mb-1 ${row.type.includes('operator') ? 'border-b-4 border-gray-800 pb-2 mb-2' : ''}`}>
                            {row.operator && <span className="mr-4 font-bold text-gray-600">{row.operator}</span>}
                            <div className="flex gap-2">
                                {row.cells.map((cell, cIdx) => (
                                    <div key={cIdx} className="w-12 h-14 flex items-center justify-center">
                                        {cell.isInput ? (
                                            <input 
                                                type="text"
                                                maxLength={1}
                                                disabled={isInteractionDisabled}
                                                value={fillBlankAnswers[cell.id!] || ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (/^\d?$/.test(val)) {
                                                        setFillBlankAnswers(prev => ({...prev, [cell.id!]: val}));
                                                    }
                                                }}
                                                className={`w-full h-full text-center border-2 rounded text-blue-600 font-bold focus:border-blue-500 focus:bg-blue-50 outline-none ${isInteractionDisabled ? 'bg-gray-100 border-gray-300' : 'border-gray-300'}`}
                                            />
                                        ) : (
                                            <span className="font-bold text-gray-800">{cell.val}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                 </div>
             </div>
             <button 
                type="submit" 
                disabled={!allFieldsFilled || isInteractionDisabled} 
                className={`mt-6 px-8 py-3 rounded-md font-bold text-white text-lg shadow-sm transition-colors ${(!allFieldsFilled || isInteractionDisabled) ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#56a700] hover:bg-green-700'}`}
            >
                Submit
            </button>
        </form>
      );
  }

  // 5. Multiple Choice
  if (question.type === 'multiple-choice' && question.options) {
    return (
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="space-y-3">
          {question.options.map((option) => (
            <label key={option.id} className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedOptionId === option.id ? 'border-[#0074e8] bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'} ${isInteractionDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <input type="radio" name="options" value={option.id} checked={selectedOptionId === option.id} onChange={(e) => setSelectedOptionId(e.target.value)} disabled={isInteractionDisabled} className="w-5 h-5 text-[#0074e8] border-gray-300 focus:ring-[#0074e8]" />
              <span className="ml-3 text-lg text-gray-800 font-medium font-sans">{option.content}</span>
            </label>
          ))}
        </div>
        <button type="submit" disabled={!selectedOptionId || isInteractionDisabled} className={`mt-6 px-8 py-3 rounded-md font-bold text-white text-lg shadow-sm transition-colors ${!selectedOptionId || isInteractionDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#56a700] hover:bg-green-700'}`}>Submit</button>
      </form>
    );
  }

  // 6. Sorting
  if (question.type === 'sorting' && sortableItems.length > 0) {
    return (
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <p className="text-sm text-gray-500 mb-2 italic">Drag and drop to reorder</p>
        <div className="space-y-3">
          {sortableItems.map((item, index) => (
            <div key={item.id} draggable={!isInteractionDisabled} onDragStart={(e) => handleSortDragStart(e, index)} onDragEnter={(e) => handleSortDragEnter(e, index)} onDragEnd={handleSortDragEnd} onDragOver={(e) => e.preventDefault()} className={`flex items-center p-4 border-2 bg-white rounded-lg transition-all duration-200 shadow-sm ${isInteractionDisabled ? 'cursor-default opacity-80' : 'cursor-move hover:border-[#0074e8] hover:shadow-md'}`}>
               <GripVertical className="text-gray-400 mr-3" />
               <span className="text-xl font-bold text-gray-800">{item.content}</span>
            </div>
          ))}
        </div>
        <button type="submit" disabled={isInteractionDisabled} className={`mt-6 px-8 py-3 rounded-md font-bold text-white text-lg shadow-sm transition-colors ${isInteractionDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#56a700] hover:bg-green-700'}`}>Submit</button>
      </form>
    );
  }

  // 7. Fill In Blank
  if (question.type === 'fill-in-blank' && question.content) {
    const parts = question.content.stimulus.content.split(/(\[.*?\])/);
    const allFilled = question.content.blanks.every((b: any) => fillBlankAnswers[b.id]?.trim().length > 0);

    return (
      <form onSubmit={handleSubmit} className="w-full max-w-3xl">
         {question.content.instructions && <p className="mb-4 text-gray-500 font-medium">{question.content.instructions}</p>}
         <div className="text-xl md:text-2xl leading-loose font-medium text-gray-800">
            {parts.map((part: string, index: number) => {
                const match = part.match(/^\[(.*?)\]$/);
                const blankId = match ? match[1] : null;
                const blankDef = blankId ? question.content?.blanks.find((b: any) => b.id === blankId) : null;

                if (blankDef) {
                    return (
                        <span key={index} className="inline-block mx-1 align-baseline">
                            <input
                                type="text"
                                value={fillBlankAnswers[blankDef.id] || ''}
                                onChange={(e) => setFillBlankAnswers(prev => ({ ...prev, [blankDef.id]: e.target.value }))}
                                disabled={isInteractionDisabled}
                                placeholder={blankDef.hint || ''}
                                style={{ width: blankDef.length ? `${blankDef.length * 1.2}em` : '8rem' }}
                                className={`bg-white border-b-2 border-gray-300 text-center text-[#0074e8] font-bold outline-none rounded-t px-2 focus:border-[#0074e8] focus:bg-blue-50 transition-colors ${isInteractionDisabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                autoComplete="off"
                            />
                        </span>
                    );
                }
                return <span key={index}>{part}</span>;
            })}
         </div>
         <button type="submit" disabled={!allFilled || isInteractionDisabled} className={`mt-8 px-8 py-3 rounded-md font-bold text-white text-lg shadow-sm transition-colors ${(!allFilled || isInteractionDisabled) ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#56a700] hover:bg-green-700'}`}>Submit</button>
      </form>
    );
  }

  // 8. Text Input (Fallback)
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex items-center gap-2">
        <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)} disabled={isInteractionDisabled} placeholder={question.placeholder || 'Type your answer...'} className="flex-1 p-4 border-2 border-gray-300 rounded-lg focus:border-[#0074e8] focus:ring-2 focus:ring-blue-100 outline-none text-xl transition-all" autoFocus />
        {question.unit && <span className="text-xl font-semibold text-gray-600">{question.unit}</span>}
      </div>
      <button type="submit" disabled={!textInput.trim() || isInteractionDisabled} className={`mt-6 px-8 py-3 rounded-md font-bold text-white text-lg shadow-sm transition-colors ${(!textInput.trim() || isInteractionDisabled) ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#56a700] hover:bg-green-700'}`}>Submit</button>
    </form>
  );
};