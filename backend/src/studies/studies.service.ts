import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Study, StudyDocument, ACTIVITY_TYPES } from './schemas/study.schema';

@Injectable()
export class StudiesService {
  constructor(
    @InjectModel(Study.name) private studyModel: Model<StudyDocument>,
  ) {}

  private validateSequence(sequence: string[]): void {
    const valid = new Set<string>(ACTIVITY_TYPES);
    for (const s of sequence) {
      if (!valid.has(s)) {
        throw new BadRequestException(`Tipo de actividad no válido: ${s}. Use: ${ACTIVITY_TYPES.join(', ')}`);
      }
    }
  }

  async create(professionalId: string, name: string | undefined, sequence: string[]): Promise<StudyDocument> {
    this.validateSequence(sequence);
    return this.studyModel.create({
      name: name?.trim() || 'Estudio sin nombre',
      professionalId,
      sequence,
    });
  }

  async findAllByProfessional(professionalId: string): Promise<StudyDocument[]> {
    return this.studyModel.find({ professionalId }).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string, professionalId: string): Promise<StudyDocument> {
    const study = await this.studyModel.findById(id).exec();
    if (!study) throw new NotFoundException('Estudio no encontrado.');
    if (study.professionalId !== professionalId) {
      throw new ForbiddenException('No tiene acceso a este estudio.');
    }
    return study;
  }

  async update(id: string, professionalId: string, name?: string, sequence?: string[]): Promise<StudyDocument> {
    const study = await this.findOne(id, professionalId);
    if (name !== undefined) study.name = name.trim();
    if (sequence !== undefined) {
      this.validateSequence(sequence);
      study.sequence = sequence;
    }
    await study.save();
    return study;
  }

  async remove(id: string, professionalId: string): Promise<void> {
    await this.findOne(id, professionalId);
    await this.studyModel.findByIdAndDelete(id).exec();
  }

  getActivityForSessionIndex(sequence: string[], sessionIndex: number): string {
    if (sequence.length === 0) throw new BadRequestException('El estudio no tiene actividades en la secuencia.');
    const index = (sessionIndex - 1) % sequence.length;
    return sequence[index];
  }
}
