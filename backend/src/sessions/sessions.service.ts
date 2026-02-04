import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from './schemas/session.schema';
import { StudiesService } from '../studies/studies.service';
import { PatientsService } from '../patients/patients.service';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    private studiesService: StudiesService,
    private patientsService: PatientsService,
  ) {}

  async create(
    professionalId: string,
    patientId: string,
    studyId: string,
    sessionIndex: number,
    scheduledAt: string,
  ): Promise<SessionDocument> {
    await this.patientsService.findOne(patientId, professionalId);
    const study = await this.studiesService.findOne(studyId, professionalId);
    const activityType = this.studiesService.getActivityForSessionIndex(study.sequence, sessionIndex);
    return this.sessionModel.create({
      patientId,
      professionalId,
      studyId,
      sessionIndex,
      activityType,
      scheduledAt: new Date(scheduledAt),
      status: 'scheduled',
    });
  }

  async findByPatient(patientId: string, professionalId: string): Promise<SessionDocument[]> {
    await this.patientsService.findOne(patientId, professionalId);
    return this.sessionModel.find({ patientId }).sort({ sessionIndex: 1 }).exec();
  }

  async findOne(id: string, professionalId: string): Promise<SessionDocument> {
    const session = await this.sessionModel.findById(id).exec();
    if (!session) throw new NotFoundException('Sesión no encontrada.');
    if (session.professionalId !== professionalId) {
      throw new ForbiddenException('No tiene acceso a esta sesión.');
    }
    return session;
  }

  async update(
    id: string,
    professionalId: string,
    dto: { sessionIndex?: number; scheduledAt?: string; status?: string },
  ): Promise<SessionDocument> {
    const session = await this.findOne(id, professionalId);
    if (dto.scheduledAt !== undefined) session.scheduledAt = new Date(dto.scheduledAt);
    if (dto.status !== undefined) session.status = dto.status;
    if (dto.sessionIndex !== undefined) {
      const study = await this.studiesService.findOne(session.studyId, professionalId);
      session.sessionIndex = dto.sessionIndex;
      session.activityType = this.studiesService.getActivityForSessionIndex(study.sequence, dto.sessionIndex);
    }
    await session.save();
    return session;
  }

  async remove(id: string, professionalId: string): Promise<void> {
    await this.findOne(id, professionalId);
    await this.sessionModel.findByIdAndDelete(id).exec();
  }

  async getNextSessionIndex(patientId: string): Promise<number> {
    const last = await this.sessionModel.findOne({ patientId }).sort({ sessionIndex: -1 }).exec();
    return last ? last.sessionIndex + 1 : 1;
  }

  async getNextSessionIndexForPatient(patientId: string, professionalId: string): Promise<number> {
    await this.patientsService.findOne(patientId, professionalId);
    return this.getNextSessionIndex(patientId);
  }
}
