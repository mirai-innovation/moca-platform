export class CreateSessionDto {
  patientId!: string;
  studyId!: string;
  sessionIndex!: number;
  scheduledAt!: string;
}
