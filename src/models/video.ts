import mongoose, { Schema } from 'mongoose';

export interface IVideo {
  filename: string;
  authorId: string;
  duration: number;
  tags: string[];
}

const VideoSchema: Schema = new Schema({
  filename: { type: String, required: true },
  authorId: { type: String, required: true },
  duration: { type: Number, required: true },
  tags: { type: [String], required: true },
});

export const Video = mongoose.model<IVideo>('Video', VideoSchema);
