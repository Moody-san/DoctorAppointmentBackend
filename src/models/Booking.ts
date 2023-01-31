import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  patientmail: string;

  @Column()
  aptdate: string;

  @Column()
  doctormail: string;

  @Column({ nullable: true })
  paidAmount: number;
}
