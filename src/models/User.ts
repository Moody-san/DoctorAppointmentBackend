import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";
import { MinLength, IsEmail, IsNotEmpty, IsLowercase } from "class-validator";

export enum Role {
  Patient = "Patient",
  Doctor = "Doctor",
  Admin = "Admin",
}

export enum Gender {
  Male = "Male",
  Female = "Female",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  @IsNotEmpty()
  @IsEmail()
  @IsLowercase()
  email: string;

  @Column({ select: false })
  @MinLength(10, {
    message: "password is too short. Minimal length is $constraint1 characters",
  })
  @IsNotEmpty()
  password: string;

  @Column({
    type: "enum",
    enum: Role,
  })
  role: Role;

  @Column({ nullable: true })
  mailcode: string;

  @CreateDateColumn({
    nullable: true,
    type: "timestamp",
    precision: 3,
  })
  validtill: Date;
}
