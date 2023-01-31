import { AppDataSource } from "./../dbconfig";
import { DoctorSchedule } from "./../models/DoctorSchedule";

export const DoctorScheduleRepository = AppDataSource.getRepository(
  DoctorSchedule
).extend({});
