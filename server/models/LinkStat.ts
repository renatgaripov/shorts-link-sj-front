import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILinkStat extends Document {
  linkId: Types.ObjectId;
  date: Date;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

const LinkStatSchema = new Schema<ILinkStat>(
  {
    linkId: {
      type: Schema.Types.ObjectId,
      ref: 'Link',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

LinkStatSchema.index({ linkId: 1, date: 1 }, { unique: true });

export default mongoose.models.LinkStat || mongoose.model<ILinkStat>('LinkStat', LinkStatSchema);

