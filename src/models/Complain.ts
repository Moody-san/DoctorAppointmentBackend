import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from "typeorm";
import { Appointment } from "./Appointment";

@Entity()
export class Complain {
  @PrimaryColumn()
  appointmentId: number;
  @OneToOne(() => Appointment, { onDelete: "CASCADE" })
  @JoinColumn()
  appointment: Appointment;

  @Column({ nullable: true })
  description: string;

  @Column()
  reason: string;
}
