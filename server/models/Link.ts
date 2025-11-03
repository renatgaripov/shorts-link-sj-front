import mongoose, { Schema, Document } from 'mongoose';

export interface ILink extends Document {
  name: string;
  short: string;
  full: string;
  project?: string;
  clicks: number;
  created_at: Date;
  userId?: string;
}

const LinkSchema = new Schema<ILink>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  short: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  full: {
    type: String,
    required: true,
    trim: true,
  },
  project: {
    type: String,
    trim: true,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: String,
    trim: true,
  },
});

export default mongoose.models.Link || mongoose.model<ILink>('Link', LinkSchema);

