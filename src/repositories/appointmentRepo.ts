import { AppDataSource } from "./../dbconfig";
import { Appointment } from "./../models/Appointment";

export const AppointmentRepository = AppDataSource.getRepository(
  Appointment
).extend({});
