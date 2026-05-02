import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog {
  action: string;
  user: mongoose.Types.ObjectId;
  timestamp: Date;
  details?: string;
}

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  project: mongoose.Types.ObjectId;
  assignee?: mongoose.Types.ObjectId;
  dueDate?: Date;
  attachments: string[];
  activityLog: IActivityLog[];
  createdAt: Date;
  updatedAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    action: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
    details: { type: String },
  },
  { _id: false }
);

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    assignee: { type: Schema.Types.ObjectId, ref: 'User' },
    dueDate: { type: Date },
    attachments: [{ type: String }],
    activityLog: [activityLogSchema],
  },
  { timestamps: true }
);

taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignee: 1 });

taskSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    // Frontend expects assignee_id as string, not populated object
    ret.assignee_id = typeof ret.assignee === 'object' && ret.assignee?._id
      ? ret.assignee._id.toString()
      : ret.assignee?.toString() || null;
    ret.due_date = ret.dueDate || null;
    ret.project_id = typeof ret.project === 'object' && ret.project?._id
      ? ret.project._id.toString()
      : ret.project?.toString();
    ret.created_at = ret.createdAt;
    ret.updated_at = ret.updatedAt;
    delete ret._id;
    delete ret.__v;
    delete ret.assignee;
    delete ret.dueDate;
    delete ret.project;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

export const Task = mongoose.model<ITask>('Task', taskSchema);
