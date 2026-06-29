import mongoose from 'mongoose';
import { TASK_PRIORITY, TASK_STATUS } from '../constants/index.js';

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    priority: {
      type: String,
      enum: Object.values(TASK_PRIORITY),
      default: TASK_PRIORITY.MEDIUM
    },
    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.TODO
    },
    dueDate: {
      type: Date,
      required: false
    },
    estimatedMinutes: {
      type: Number,
      default: 60,
      min: 0
    },
    actualMinutes: {
      type: Number,
      default: 0,
      min: 0
    },
    tags: [{
      type: String,
      trim: true
    }],
    archived: {
      type: Boolean,
      default: false
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        ret.completed = ret.status === TASK_STATUS.COMPLETED;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Compound indexes optimized for user-scoped queries
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, dueDate: 1 });

export const Task = mongoose.model('Task', taskSchema);
