import mongoose from 'mongoose';
import { PLANNER_EVENT_TYPE } from '../constants/index.js';

const plannerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Planner event must belong to a user'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required']
    },
    type: {
      type: String,
      enum: Object.values(PLANNER_EVENT_TYPE),
      default: PLANNER_EVENT_TYPE.STUDY
    },
    color: {
      type: String,
      default: '#A855F7'
    },
    completed: {
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
        // Provide formatted strings for UI compatibility
        if (ret.startTime) {
          const dt = new Date(ret.startTime);
          ret.startTimeDisplay = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          ret.dateStr = dt.toISOString().split('T')[0];
        }
        if (ret.endTime) {
          const dtEnd = new Date(ret.endTime);
          ret.endTimeDisplay = dtEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Compound index optimized for user-scoped date range queries
plannerSchema.index({ user: 1, startTime: 1 });

export const Planner = mongoose.model('Planner', plannerSchema);
