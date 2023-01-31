import {
  Entity,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
  Column,
  OneToMany,
} from "typeorm";
import { User, Gender } from "./User";
import { IsNotEmpty, IsMobilePhone } from "class-validator";
import { Appointment } from "./Appointment";
import { Review } from "./Review";

@Entity()
export class Patient {
  @Column({
    type: "enum",
    enum: Gender,
  })
  @IsNotEmpty()
  gender: Gender;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsNotEmpty()
  phone: string;

  @Column()
  @IsNotEmpty()
  photo: string;

  @PrimaryColumn()
  userId: number;
  @OneToOne(() => User, { cascade: ["insert"], onDelete: "CASCADE" })
  @JoinColumn()
  user: User;

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  appointment: Appointment[];

  @OneToMany(() => Review, (review) => review.patient)
  review: Review[];
}
