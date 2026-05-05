import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  type: 'task_assigned' | 'task_updated' | 'comment_added' | 'project_invite' | 'due_soon';
  message: string;
  user: mongoose.Types.ObjectId;
  relatedTask?: mongoose.Types.ObjectId;
  relatedProject?: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    type: {
      type: String,
      enum: ['task_assigned', 'task_updated', 'comment_added', 'project_invite', 'due_soon'],
      required: true,
    },
    message: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    relatedTask: { type: Schema.Types.ObjectId, ref: 'Task' },
    relatedProject: { type: Schema.Types.ObjectId, ref: 'Project' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.set('toJSON', {
  transform(_doc, ret: any) {
    ret.id = ret._id;
    delete (ret as any).__v;
    return ret;
  },
});

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
