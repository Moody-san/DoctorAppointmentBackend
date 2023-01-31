import { DataSource } from "typeorm";
import { User } from "./models/User";
import { Patient } from "./models/Patient";
import { Doctor } from "./models/Doctor";
import env from "./../config";
import { DoctorSchedule } from "./models/DoctorSchedule";
import { Appointment } from "./models/Appointment";
import { Review } from "./models/Review";
import { Complain } from "./models/Complain";
import { Booking } from "./models/Booking";
import { Blog } from "./models/Blog";
const AppDataSource = new DataSource({
  type: "postgres",
  host: env.DATABASE_HOST,
  port: Number(env.DATABASE_PORT),
  username: env.DATABASE_USERNAME,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE,
  entities: [
    User,
    Patient,
    Doctor,
    DoctorSchedule,
    Appointment,
    Review,
    Complain,
    Booking,
    Blog,
  ],
  synchronize: true,
  logging: false,
});

export { AppDataSource };
