import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
} from "typeorm";
import { DoctorSchedule } from "./DoctorSchedule";
import { Patient } from "./Patient";

@Entity()
@Unique(["aptdate", "doctorschedule", "patient"])
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  aptdate: string;

  @Column({ default: false })
  paid: boolean;

  @ManyToOne(
    () => DoctorSchedule,
    (doctorschedule) => doctorschedule.appointment,
    { onDelete: "CASCADE" }
  )
  doctorschedule: DoctorSchedule;

  @ManyToOne(() => Patient, (patient) => patient.appointment, {
    onDelete: "CASCADE",
  })
  patient: Patient;
}
