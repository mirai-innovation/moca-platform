import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient, PatientDocument } from './schemas/patient.schema';

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
  ) {}

  async create(professionalId: string, dto: { name: string; studyId?: string; identifier?: string; dateOfBirth?: string; notes?: string; photo?: string }): Promise<PatientDocument> {
    const patient = await this.patientModel.create({
      ...dto,
      professionalId,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
    });
    return patient;
  }

  async findAllByProfessional(professionalId: string): Promise<PatientDocument[]> {
    return this.patientModel.find({ professionalId }).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string, professionalId: string): Promise<PatientDocument> {
    const patient = await this.patientModel.findById(id).exec();
    if (!patient) throw new NotFoundException('Paciente no encontrado.');
    if (patient.professionalId !== professionalId) {
      throw new ForbiddenException('No tiene acceso a este paciente.');
    }
    return patient;
  }

  async update(id: string, professionalId: string, dto: { name?: string; studyId?: string; identifier?: string; dateOfBirth?: string; notes?: string; photo?: string }): Promise<PatientDocument> {
    const patient = await this.findOne(id, professionalId);
    if (dto.name !== undefined) patient.name = dto.name;
    if (dto.studyId !== undefined) patient.studyId = dto.studyId;
    if (dto.identifier !== undefined) patient.identifier = dto.identifier;
    if (dto.dateOfBirth !== undefined) patient.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined;
    if (dto.notes !== undefined) patient.notes = dto.notes;
    if (dto.photo !== undefined) patient.photo = dto.photo;
    await patient.save();
    return patient;
  }

  async remove(id: string, professionalId: string): Promise<void> {
    await this.findOne(id, professionalId);
    await this.patientModel.findByIdAndDelete(id).exec();
  }
}
