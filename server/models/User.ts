import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  login: string;
  password: string;
  role: 1 | 2;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  login: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: Number,
    enum: [1, 2],
    default: 1,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

