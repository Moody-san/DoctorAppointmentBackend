import { AppError } from "./../utils/AppError";
import { PatientRepository } from "./../repositories/patientRepo";
export class patientService {
  constructor() {}

  public async NoofPatients() {
    try {
      let patient = await PatientRepository.createQueryBuilder("patient")
        .select("COUNT(*)", "COUNT")
        .getRawMany();
      return patient;
    } catch (error) {
      throw error;
    }
  }

  public async getPatients(page: any, limit: any) {
    try {
      let p: number = +page || 1;
      let l: number = +limit || 10;
      let s: number = (p - 1) * l;
      let patients = await PatientRepository.createQueryBuilder("patient")
        .select([
          "user.email",
          "patient.phone",
          "patient.photo",
          "patient.name",
          "patient.gender",
          "patient.userId",
        ])
        .innerJoin("patient.user", "user")
        .skip(s)
        .take(l)
        .getRawMany();
      return patients;
    } catch (error) {
      throw error;
    }
  }

  public async findPatientByName(name: any) {
    try {
      if (name === undefined) {
        throw new AppError("not found", 400);
      }
      let patients: any = await PatientRepository.createQueryBuilder("patient")
        .select([
          "user.email",
          "patient.phone",
          "patient.photo",
          "patient.name",
          "patient.gender",
          "patient.userId",
        ])
        .innerJoin("patient.user", "user")
        .where("LOWER(patient.name) like :name", {
          name: `%${name.toLowerCase()}%`,
        })
        .getRawMany();
      if (patients === null) {
        throw new AppError("Patients not found", 404);
      }
      return patients;
    } catch (error) {
      throw error;
    }
  }
}
