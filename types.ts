
// 1. The Question Type Enum
export type QuestionType = 
  | 'multiple-choice' 
  | 'text-input' 
  | 'fill-in-blank'
  | 'sorting' 
  | 'drag-and-drop'
  | 'graphing' 
  | 'number-line' 
  | 'equation'
  | 'vertical-equation' 
  | 'vertical-multiplication';

export interface FillBlankContent {
  prompt: string;
  instructions?: string;
  stimulus: {
    type: string;
    content: string; 
  };
  blanks: Array<{ 
    id: string; 
    position?: number; 
    length?: number; 
    hint?: string;
    correctAnswer: string; 
  }>;
}

export interface VerticalConfig {
  top: string;    
  bottom: string; 
  operator: '+' | '-' | '×';
  showPlaceholders?: boolean; 
}

export interface QuestionOption {
  id: string;
  content: string; 
  isCorrect: boolean;
  image?: string; 
}

export interface SortingItem {
  id: string;
  content: string;
  image?: string; 
}

export interface GraphConfig {
  xRange: [number, number]; 
  yRange: [number, number]; 
  gridStep: number;         
  targetType: 'point' | 'line' | 'bar'; 
  correctPoints?: { x: number; y: number }[]; 
}

// Updated Number Line Config
export interface NumberLineConfig {
  min: number;
  max: number;
  step: number;
  labels?: number[]; 
  correctValue?: number; // Single point target
  correctValues?: number[]; // Multi-select targets
  interactionType?: 'point' | 'multi-select';
  tolerance?: number; 
}

export interface DragDropItem {
  id: string;
  content: string;
}

export interface DragDropZone {
  id: string;
  label: string;
}

export interface DragDropConfig {
  items: DragDropItem[];
  zones: DragDropZone[];
  correctMapping: Record<string, string>; 
}

// New Vertical Grid Structures
export interface VerticalCell {
    val: string;
    isInput: boolean;
    id?: string; // If input, this matches expectedAnswer id
}
  
export interface VerticalRow {
    type: 'factor' | 'factor-operator' | 'partial' | 'partial-operator' | 'result';
    cells: VerticalCell[];
    operator?: string;
}
  
export interface VerticalGridConfig {
    rows: VerticalRow[];
    maxLength?: number; // For container width sizing
}

export interface Question {
  id: string;
  skillId: string;
  type: QuestionType;
  difficultyLevel?: string;
  
  prompt: {
    text: string;
    image?: string;
    audio?: string;
  };

  explanation: {
    text?: string;
    steps?: string[];
    image?: string;
  };

  // Content holds type-specific structures like FillBlankContent or VerticalGridConfig
  content?: any; 
  
  answerConfig?: {
    expectedAnswers: Array<{ id: string; value: string | number; tolerance?: string }>;
  };

  options?: QuestionOption[]; 
  multiSelect?: boolean; 

  correctAnswer?: string; 
  acceptableAnswers?: string[]; 
  unit?: string; 
  placeholder?: string; 
  
  items?: SortingItem[]; 
  correctOrder?: string[]; 
  sortingLayout?: 'row' | 'column';

  graphConfig?: GraphConfig;
  dragDropConfig?: DragDropConfig;
  numberLineConfig?: NumberLineConfig;
  verticalConfig?: VerticalConfig;
  // verticalMultiStepConfig property removed in favor of generic content for vertical-multiplication
}

// Updated SkillData to match new Schema
export interface SkillData {
  skillId: string;    // Was 'id'
  displayName: string; // Was 'name'
  shortName?: string;
  description: string;
  questions?: Question[];
  // Add other fields from schema if needed in frontend
}

export interface CategoryData {
  name: string;
  skills: SkillData[];
}

export interface GradeData {
  id: string;
  label: string;
  categories: CategoryData[];
}

export interface LessonData {
  subject: string;
  grade: string;
  category: string;
  skill: SkillData;
}

export type Subject = 'Math' | 'Language Arts' | 'Science' | 'Social Studies';
