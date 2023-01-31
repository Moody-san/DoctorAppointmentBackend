import {
  Entity,
  Column,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { User, Gender } from "./User";
import {
  Max,
  IsNotEmpty,
  ArrayNotEmpty,
  IsString,
  IsNumber,
  IsMobilePhone,
  Min,
} from "class-validator";
import { DoctorSchedule } from "./DoctorSchedule";
import { Review } from "./Review";
import { Blog } from "./Blog";

@Entity()
export class Doctor {
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
  @IsMobilePhone("en-PK")
  phone: string;

  @Column()
  @IsNotEmpty()
  @Min(0)
  sessionfee: number;

  @Column({ array: true })
  @IsString({ each: true })
  @ArrayNotEmpty()
  qualifications: string;

  @Column()
  @IsNumber()
  @Max(5)
  @Min(0)
  rating: number;

  @Column({ array: true })
  @IsString({ each: true })
  @ArrayNotEmpty()
  specializedtreatments: string;

  @Column()
  @IsNotEmpty()
  photo: string;

  @PrimaryColumn()
  userId: number;
  @OneToOne(() => User, { cascade: ["insert"], onDelete: "CASCADE" })
  @JoinColumn()
  user: User;

  @OneToMany(() => DoctorSchedule, (doctorschedule) => doctorschedule.doctor, {
    cascade: ["insert"],
  })
  doctorschedule: DoctorSchedule[];

  @OneToMany(() => Blog, (blog) => blog.doctor)
  blog: Blog[];

  @OneToMany(() => Review, (review) => review.doctor)
  review: Review[];
}
