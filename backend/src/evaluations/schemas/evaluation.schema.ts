import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EvaluationDocument = Evaluation & Document;

@Schema({ timestamps: true })
export class Evaluation {
  @Prop({ required: true })
  testId: string;

  @Prop({ required: true })
  patientId: string;

  @Prop({ required: true })
  professionalId: string;

  @Prop({ type: String, enum: ['in_progress', 'completed'], default: 'in_progress' })
  status: string;

  @Prop({ default: 0 })
  visuospatial: number;

  @Prop({ default: 0 })
  naming: number;

  @Prop({ default: 0 })
  attention: number;

  @Prop({ default: 0 })
  language: number;

  @Prop({ default: 0 })
  abstraction: number;

  @Prop({ default: 0 })
  delayedRecall: number;

  @Prop({ default: 0 })
  orientation: number;

  @Prop({ default: 0 })
  total: number;

  @Prop({ default: false })
  educationAdjust: boolean;

  @Prop()
  completedAt?: Date;
}

export const EvaluationSchema = SchemaFactory.createForClass(Evaluation);
EvaluationSchema.index({ professionalId: 1, completedAt: -1 });
EvaluationSchema.index({ testId: 1 }, { unique: true });
EvaluationSchema.index({ patientId: 1 });
