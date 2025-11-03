import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  login: string;
  password: string;
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

