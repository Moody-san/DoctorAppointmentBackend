import { DoctorRepository } from "./../repositories/doctorRepo";
import { PatientRepository } from "./../repositories/patientRepo";
import { Gender, Role } from "./../models/User";
import { AppError } from "./../utils/AppError";
import { UserRepository } from "./../repositories/userRepo";
import { client, ready } from "./../redis";
import bcrypt from "bcryptjs";
export class userService {
  constructor() {}

  private async Cache(id: number | undefined, check: number, data: any) {
    try {
      if (check) {
        const data = await client.get(`user?${id}`);
        if (data !== null) {
          console.log("hit");
          return JSON.parse(data);
        } else {
          return null;
        }
      } else {
        await client.setEx(`user?${id}`, 3600, JSON.stringify(data));
      }
    } catch (error) {
      console.log("\nerror:\n", error);
      return null;
    }
  }

  public getUserData = async (id?: number, role?: Role) => {
    try {
      if (ready) {
        let cachehit = await this.Cache(id, 1, null);
        if (cachehit !== null) {
          return cachehit;
        }
      }
      console.log("reached here");
      let data;
      if (role === Role.Doctor) {
        data = await DoctorRepository.createQueryBuilder("doctor")
          .select([
            ...DoctorRepository.doctorSelectionArray(),
            ...["user.email", "user.role"],
          ])
          .innerJoin("doctor.user", "user")
          .innerJoin("doctor.doctorschedule", "doctorschedule")
          .where("user.id = :id", { id: id })
          .getOne();
      } else if (role === Role.Patient) {
        data = await PatientRepository.createQueryBuilder("patient")
          .select([
            "patient.userId",
            "user.email",
            "user.role",
            "patient.name",
            "patient.photo",
            "patient.gender",
            "patient.phone",
          ])
          .innerJoin("patient.user", "user")
          .where("user.id = :id", { id: id })
          .getOne();
      } else if (role === Role.Admin) {
        data = await UserRepository.createQueryBuilder("user")
          .select(["user.id", "user.email", "user.role"])
          .where("user.id = :id", { id: id })
          .getOne();
      } else {
        throw new AppError("unable to determine user role", 404);
      }
      if (ready) {
        this.Cache(id, 0, data);
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  public deleteById = async (id: string) => {
    try {
      let Id = parseInt(id);
      await UserRepository.delete({ id: Id });
    } catch (error) {
      throw error;
    }
  };

  public async changeUserPw(
    oldpw: string,
    newpwconfirm: string,
    newpw: string,
    id?: number
  ) {
    try {
      if (newpw !== newpwconfirm) {
        throw new AppError("Passwords do not match", 400);
      }
      if (newpw.length < 10) {
        throw new AppError("Passwords must be greater than 10 in length", 400);
      }
      const user = await UserRepository.findOne({
        select: ["password"],
        where: { id: id },
      });
      if (user === null) {
        throw new AppError("User not found", 400);
      }
      if (await bcrypt.compare(oldpw, user.password)) {
        let newpass = await bcrypt.hash(newpw, 12);
        await UserRepository.createQueryBuilder("user")
          .update()
          .set({ password: newpass })
          .where("id = :id", { id: id })
          .execute();
      } else {
        throw new AppError("Password incorrect", 400);
      }
    } catch (error) {
      throw error;
    }
  }

  public async ChangeInfo(property: any, value: any, role?: Role, id?: number) {
    try {
      let user: any;
      if (role === Role.Patient) {
        user = await PatientRepository.findOne({ where: { userId: id } });
      } else if (role === Role.Doctor) {
        user = await DoctorRepository.findOne({ where: { userId: id } });
      }
      if (user === null || undefined) {
        throw new AppError("User not found", 400);
      }
      this.setproperty(user, property, value);
      if (role === Role.Patient) {
        PatientRepository.save(user);
      } else {
        DoctorRepository.save(user);
      }
    } catch (error) {
      throw error;
    }
  }

  public setproperty(user: any, property: any, value: any) {
    try {
      for (let i = 0; i < property.length; i++) {
        if (property[i] === "name") {
          if (value[i] === "" || null) {
            throw new AppError("name must not be empty", 400);
          }
          user.name = value[i];
        } else if (property[i] === "gender") {
          if (value[i] === "male") {
            user.gender = Gender.Male;
          } else if (value[i] === "female") {
            user.gender = Gender.Female;
          } else {
            throw new AppError("Gender must be male or female", 400);
          }
        } else if (property[i] === "phone") {
          user.phone = value[i];
        } else if (property[i] === "sessionfee") {
          let fee = parseInt(value[i]);
          if (fee >= 0) {
            user.sessionfee = fee;
          } else {
            throw new AppError("fee must be positive", 400);
          }
        } else {
          throw new AppError("Property does not exist", 400);
        }
      }
    } catch (error) {
      throw error;
    }
  }
}
