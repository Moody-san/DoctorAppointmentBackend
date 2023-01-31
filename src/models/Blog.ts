import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { Doctor } from "./Doctor";

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @CreateDateColumn({
    nullable: true,
    type: "timestamp",
    precision: 3,
  })
  addedon: Date;

  @Column()
  content: string;

  @Column({ array: true })
  tags: string;

  @Column()
  author: string;

  @ManyToOne(() => Doctor, (doctor) => doctor.blog, {
    onDelete: "CASCADE",
  })
  doctor: Doctor;
}
