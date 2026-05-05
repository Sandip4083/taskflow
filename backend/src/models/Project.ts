import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

projectSchema.set('toJSON', {
  transform(_doc, ret: any) {
    ret.id = ret._id.toString();
    // Frontend expects owner_id as string
    ret.owner_id = typeof ret.owner === 'object' && ret.owner?._id
      ? ret.owner._id.toString()
      : ret.owner?.toString();
    ret.created_at = ret.createdAt;
    ret.updated_at = ret.updatedAt;
    delete (ret as any)._id;
    delete (ret as any).__v;
    delete (ret as any).createdAt;
    delete (ret as any).updatedAt;
    return ret;
  },
});

export const Project = mongoose.model<IProject>('Project', projectSchema);
