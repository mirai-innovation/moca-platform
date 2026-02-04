export class CreatePatientDto {
  name!: string;
  studyId?: string;
  identifier?: string;
  dateOfBirth?: string;
  notes?: string;
  photo?: string;
}
