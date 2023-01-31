import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
} from "typeorm";
import { Doctor } from "./Doctor";
import { Patient } from "./Patient";

@Entity()
@Unique(["reviewdate", "doctor", "patient"])
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  stars: number;

  @Column()
  reviewdate: string;

  @Column({ nullable: true })
  reviewtext: string;

  @ManyToOne(() => Doctor, (doctor) => doctor.review, { onDelete: "CASCADE" })
  doctor: Doctor;

  @ManyToOne(() => Patient, (patient) => patient.review)
  patient: Patient;
}
