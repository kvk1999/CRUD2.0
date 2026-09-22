import { Schema, model, Document } from 'mongoose';

export type Role = 'admin' | 'user' | 'guest';

export interface UserFields {
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export type IUser = UserFields & Document;
export type AuthenticatedUser = IUser & { role: Role };

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'users' });

export const User = model<IUser>('User', UserSchema);