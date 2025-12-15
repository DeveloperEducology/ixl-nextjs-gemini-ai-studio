import mongoose, { Schema, Document } from 'mongoose';
import { QuestionSchema } from './Question';

// --- Core Schemas ---

const DomainSchema = new Schema({
  id: String,
  name: String
}, { _id: false });

export const GradeSchema = new Schema({
  gradeId: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  shortName: { type: String, required: true },
  ageRange: { min: Number, max: Number },
  commonCoreGrade: String,
  teksGradeLevel: String,
  subjects: [{
    subjectId: { type: String },
    order: Number,
    isCore: { type: Boolean, default: true },
    domains: [String]
  }],
  totalSkills: { type: Number, default: 0 },
  completedSkills: { type: Number, default: 0 },
  averageMasteryTime: Number,
  uiConfig: {
    themeColor: String,
    icon: String,
    backgroundImage: String,
  },
  accessibility: {
    readingTools: [String],
    mathTools: [String],
    defaultFontSize: String
  },
  isActive: { type: Boolean, default: true },
  version: { type: Number, default: 1 }
}, { timestamps: true });

export const SubjectSchema = new Schema({
  subjectId: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  shortName: { type: String, required: true },
  description: String,
  icon: String,
  color: String,
  availableGrades: [{
    gradeId: { type: String },
    order: Number,
    isAvailable: { type: Boolean, default: true }
  }],
  domains: [DomainSchema],
  totalSkills: { type: Number, default: 0 },
  assessmentConfig: {
    questionTypes: [String],
    adaptiveLearning: { type: Boolean, default: true },
    masteryThreshold: { type: Number, default: 80 },
    retryLimit: { type: Number, default: 3 }
  },
  gamification: {
    theme: String,
    avatars: [String],
    leaderboard: { type: Boolean, default: true }
  },
  status: { type: String, default: 'published' },
  version: { type: Number, default: 1 }
}, { timestamps: true });

export const SkillSchema = new Schema({
  skillId: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  shortName: String,
  description: String,
  
  subjectId: { type: String },
  gradeLevel: { type: String },
  domainId: { type: String }, // Made optional for seed compatibility
  
  learningObjective: String,
  keyConcept: String,
  realWorldApplication: String,
  
  prerequisiteSkills: [{
    skillId: String,
    requiredMastery: { type: Number, default: 70 }
  }],
  
  standards: [{
    code: String,
    description: String,
    source: String
  }],
  
  explanation: String,
  examples: [{
    problem: String,
    solution: String,
    explanation: String,
    visual: String
  }],
  
  // Embedded Questions (Using shared schema)
  questions: [QuestionSchema],

  questionPool: {
    totalQuestions: { type: Number, default: 0 },
    questionTypes: [String],
    difficultyDistribution: {
      easy: { type: Number, default: 0.4 },
      medium: { type: Number, default: 0.4 },
      hard: { type: Number, default: 0.2 }
    },
    adaptiveConfig: {
      initialDifficulty: { type: String, default: 'medium' },
      difficultyAdjustment: { type: Number, default: 0.1 },
      masteryThreshold: { type: Number, default: 80 },
      questionsToMaster: { type: Number, default: 10 }
    }
  },
  
  masteryConfig: {
    smartScoreTarget: { type: Number, default: 80 },
    requiredQuestions: { type: Number, default: 10 },
    timeLimit: Number,
    accuracyThreshold: { type: Number, default: 70 }
  },
  
  estimatedTime: { min: Number, max: Number, average: Number },
  difficultyLevel: { type: String, default: 'medium' },
  
  icon: String,
  color: String,
  
  analytics: {
    totalAttempts: { type: Number, default: 0 },
    avgScore: Number,
    masteryRate: Number,
    difficultyRating: Number
  },
  
  rewards: {
    points: { type: Number, default: 10 },
    badge: { name: String, icon: String, description: String }
  },
  
  accessibility: {
    altText: String,
    textToSpeech: { type: Boolean, default: true }
  },
  
  status: { type: String, default: 'published' },
  displayOrder: Number,
  isFeatured: { type: Boolean, default: false },
  isPremium: { type: Boolean, default: false }
}, { timestamps: true });

// --- Main Aggregate Schema for Course/Curriculum View ---

const CategorySchema = new Schema({
  name: { type: String, required: true },
  skills: [SkillSchema],
});

export interface ICurriculum extends Document {
  subject: string;
  gradeId: string;
  gradeLabel: string;
  categories: any[];
}

const CurriculumSchema = new Schema<ICurriculum>(
  {
    subject: { type: String, required: true },
    gradeId: { type: String, required: true },
    gradeLabel: { type: String, required: true },
    categories: [CategorySchema],
  },
  { timestamps: true }
);

CurriculumSchema.index({ subject: 1, gradeId: 1 }, { unique: true });

export const Grade = mongoose.models.Grade || mongoose.model('Grade', GradeSchema);
export const Subject = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
export const Skill = mongoose.models.Skill || mongoose.model('Skill', SkillSchema);
export const Curriculum = mongoose.models.Curriculum || mongoose.model<ICurriculum>('Curriculum', CurriculumSchema);

export default Curriculum;
