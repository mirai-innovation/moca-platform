import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const ACTIVITY_TYPES = ['MOCKA', 'VENDING', 'RELAJACION'] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export type StudyDocument = Study & Document;

@Schema({ timestamps: true })
export class Study {
  @Prop({ default: 'Estudio sin nombre' })
  name: string;

  @Prop({ required: true })
  professionalId: string;

  @Prop({ type: [String], default: [] })
  sequence: string[];
}

export const StudySchema = SchemaFactory.createForClass(Study);
StudySchema.index({ professionalId: 1 });
