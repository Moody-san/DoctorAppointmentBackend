import { AppDataSource } from "./../dbconfig";
import { Patient } from "./../models/Patient";

export const PatientRepository = AppDataSource.getRepository(Patient).extend(
  {}
);
