import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PatientDocument = Patient & Document;

@Schema({ timestamps: true })
export class Patient {
  @Prop({ required: true })
  name: string;

  @Prop()
  identifier?: string;

  @Prop({ required: true })
  professionalId: string;

  @Prop()
  studyId?: string;

  @Prop()
  dateOfBirth?: Date;

  @Prop()
  notes?: string;

  @Prop()
  photo?: string;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);
PatientSchema.index({ professionalId: 1 });
PatientSchema.index({ professionalId: 1, identifier: 1 }, { sparse: true });
