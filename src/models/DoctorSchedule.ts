import { IsNotEmpty } from "class-validator";
import {
  Entity,
  ManyToOne,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  OneToMany,
} from "typeorm";
import { Appointment } from "./Appointment";
import { Doctor } from "./Doctor";

@Entity()
export class DoctorSchedule {
  @PrimaryGeneratedColumn()
  scheduleid: number;

  @Column()
  @IsNotEmpty()
  maxappointments: number;

  @Column()
  @IsNotEmpty()
  location: string;

  @Column()
  @IsNotEmpty()
  latitude: string;

  @Column()
  @IsNotEmpty()
  longitude: string;

  @Column()
  @IsNotEmpty()
  day: string;

  @Column()
  @IsNotEmpty()
  from: string;

  @Column()
  @IsNotEmpty()
  till: string;

  @PrimaryColumn()
  doctorUserId: number;
  @ManyToOne(() => Doctor, (doctor) => doctor.doctorschedule, {
    onDelete: "CASCADE",
  })
  doctor: Doctor;

  @OneToMany(() => Appointment, (appointment) => appointment.doctorschedule)
  appointment: Appointment[];

  availabledate: any;
}
