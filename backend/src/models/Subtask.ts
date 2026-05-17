import mongoose, { Schema, Document } from 'mongoose';

export interface ISubtask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  completed: boolean;
  task: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const subtaskSchema = new Schema<ISubtask>(
  {
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    task: { type: Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
  },
  { timestamps: true }
);

subtaskSchema.set('toJSON', {
  transform(_doc, ret: any) {
    ret.id = ret._id.toString();
    delete (ret as any)._id;
    delete (ret as any).__v;
    return ret;
  },
});

export const Subtask = mongoose.model<ISubtask>('Subtask', subtaskSchema);
