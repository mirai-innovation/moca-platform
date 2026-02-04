import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {
  @Prop({ required: true })
  patientId: string;

  @Prop({ required: true })
  professionalId: string;

  @Prop({ required: true })
  studyId: string;

  @Prop({ required: true })
  sessionIndex: number;

  @Prop({ required: true })
  activityType: string;

  @Prop({ required: true })
  scheduledAt: Date;

  @Prop({ type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' })
  status: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
SessionSchema.index({ patientId: 1, sessionIndex: 1 });
SessionSchema.index({ professionalId: 1 });
