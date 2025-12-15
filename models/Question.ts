import mongoose, { Schema } from 'mongoose';

// --- Sub-Schemas for Configuration Objects ---

const OptionSchema = new Schema({
  id: String,
  content: String,
  isCorrect: Boolean,
  image: String
}, { _id: false });

const SortingItemSchema = new Schema({
  id: String,
  content: String,
  image: String
}, { _id: false });

const DragDropItemSchema = new Schema({
  id: String,
  content: String
}, { _id: false });

const DragDropZoneSchema = new Schema({
  id: String,
  label: String
}, { _id: false });

const DragDropConfigSchema = new Schema({
    items: [DragDropItemSchema],
    zones: [DragDropZoneSchema],
    correctMapping: { type: Map, of: String } // Record<itemId, zoneId>
}, { _id: false });

const GraphConfigSchema = new Schema({
    xRange: { type: [Number], required: true }, // [min, max]
    yRange: { type: [Number], required: true },
    gridStep: Number,
    targetType: { type: String, enum: ['point', 'line', 'bar'] },
    correctPoints: [{ x: Number, y: Number }]
}, { _id: false });

const NumberLineConfigSchema = new Schema({
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    step: { type: Number, required: true },
    labels: [Number],
    correctValue: Number,
    correctValues: [Number],
    interactionType: { type: String, enum: ['point', 'multi-select'], default: 'point' },
    tolerance: Number
}, { _id: false });

// --- Main Question Schema ---

export const QuestionSchema = new Schema({
  id: { type: String, required: true }, // Unique identifier string (e.g., "NL_nl-find-integer_...")
  skillId: { type: String, required: true, index: true },
  type: { 
    type: String, 
    required: true,
    enum: [
        'multiple-choice', 
        'text-input', 
        'fill-in-blank',
        'sorting', 
        'drag-and-drop', 
        'graphing', 
        'number-line', 
        'equation', 
        'vertical-equation', 
        'vertical-multiplication'
    ]
  }, 
  difficultyLevel: { type: String, default: 'medium' },
  
  prompt: {
    text: { type: String, required: true },
    image: String,
    audio: String
  },

  explanation: {
    text: String,
    steps: [String],
    image: String
  },

  // --- Type Specific Fields ---

  // Multiple Choice
  options: [OptionSchema],
  multiSelect: Boolean,
  
  // Sorting
  items: [SortingItemSchema],
  correctOrder: [String],
  sortingLayout: String,

  // Text Input / Simple Answer
  correctAnswer: String,
  acceptableAnswers: [String],
  unit: String,
  placeholder: String,

  // Structured Configurations
  graphConfig: GraphConfigSchema,
  dragDropConfig: DragDropConfigSchema,
  numberLineConfig: NumberLineConfigSchema,

  // Polymorphic Content
  // Used for 'fill-in-blank' (FillBlankContent) and 'vertical-multiplication' (VerticalGridConfig)
  content: Schema.Types.Mixed, 
  
  // Validation Configuration
  // Used for complex validations (e.g. { expectedAnswers: [...] })
  answerConfig: Schema.Types.Mixed,

  // Metadata
  tags: [String],
  isActive: { type: Boolean, default: true }
}, { 
    _id: false, // Typically false when embedded, can be true if standalone
    timestamps: true 
});

// Create and export the model if used as a standalone collection
const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);
export default Question;
