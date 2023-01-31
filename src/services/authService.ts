import jwt from "jsonwebtoken";
import env from "./../../config";
import { Gender, Role, User } from "./../models/User";
import { Patient } from "./../models/Patient";
import { UserRepository } from "./../repositories/userRepo";
import { PatientRepository } from "./../repositories/patientRepo";
import { DoctorRepository } from "./../repositories/doctorRepo";
import { AppError } from "./../utils/AppError";
import bcrypt from "bcryptjs";
import { validate } from "class-validator";
import { Doctor } from "./../models/Doctor";
import { DoctorSchedule } from "./../models/DoctorSchedule";
import { client, ready } from "./../redis";
var toonavatar = require("cartoon-avatar");
const nodemailer = require("nodemailer");

export class AuthService {
  constructor() {}

  private async sendMail(email: string, code: string) {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: env.SKINCURE_EMAIL,
          pass: env.SKINCURE_PASS,
        },
      });

      await transporter.sendMail({
        from: env.SKINCURE_EMAIL,
        to: email,
        subject: "SkinCure Code",
        text: `Here is your secret code ( ${code} ) \n.if you did not trigger this request please ignore this mail. Stay Safe and Keep on shining :)`,
      });
    } catch (error) {
      throw new AppError("email not sent", 500);
    }
  }

  private async getUser(email: string) {
    return await UserRepository.createQueryBuilder("user")
      .select(["user.id"])
      .where("user.email = :email", {
        email: email,
      })
      .getOne();
  }
  private async getdbcode(email: string) {
    const user = await UserRepository.findOne({
      where: { email: email },
    });
    let curtime = new Date();
    let validtime = new Date(`${user?.validtill}`);
    if (validtime.getTime() > curtime.getTime()) {
      return user;
    } else {
      return null;
    }
  }

  private async addCodetoDb(code: string, email: string) {
    return await UserRepository.createQueryBuilder("user")
      .update()
      .set({
        mailcode: () => `${code}`,
        validtill: () =>
          `(current_timestamp + (3 ||' minutes')::interval) AT TIME ZONE 'PKT'`,
      })
      .where("email = :email", { email: email })
      .execute();
  }

  public signToken = (id: number, role: Role) => {
    return jwt.sign({ id: id, role: role }, env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  };

  public getjwtToken = (user: User) => {
    const token = this.signToken(user.id, user.role);
    return token;
  };

  assignCommonDetails(model: any, details: any, user: User, role: Role) {
    model.user = user;
    user.role = role;
    model.name = details.name;
    model.phone = details.phone;
    if (details?.gender?.toLowerCase() === "male") {
      model.gender = Gender.Male;
      let url = toonavatar.generate_avatar({ gender: "male" });
      model.photo = url;
    } else if (details?.gender?.toLowerCase() === "female") {
      model.gender = Gender.Female;
      let url = toonavatar.generate_avatar({ gender: "female" });
      model.photo = url;
    }
    return model;
  }

  async assignDoctorDetails(model: Doctor, details: any) {
    try {
      model.sessionfee = parseInt(details.sessionfee);
      model.qualifications = details.qualifications;
      model.specializedtreatments = details.specializedtreatments;
      model.rating = 3;
      let docschedules = await this.addDoctorSchedules(details);
      if (docschedules.length) {
        model.doctorschedule = docschedules;
      }
    } catch (error) {
      throw error;
    }
  }

  async addDoctorSchedules(details: any) {
    let docschedules: DoctorSchedule[] = [];
    for (let i = 0; i < details.schedules.length; i++) {
      let schedule = details.schedules[i];
      const docschedule = new DoctorSchedule();
      docschedule.day = schedule.day;
      docschedule.till = schedule.till;
      docschedule.from = schedule.from;
      docschedule.latitude = schedule.latitude;
      docschedule.longitude = schedule.longitude;
      docschedule.location = schedule.location;
      docschedule.maxappointments = schedule.maxappointments;
      await this.SchemaValidation(docschedule);
      docschedules.push(docschedule);
    }
    return docschedules;
  }

  async SchemaValidation(model: User | Doctor | Patient | DoctorSchedule) {
    const errors = await validate(model, {
      validationError: { target: false },
    });
    if (errors.length > 0) {
      const errorObj = Object(errors[0].constraints);
      for (var i in errorObj) {
        throw new AppError(errorObj[i], 400);
      }
    }
  }

  public async registerUserService(user: User, details: any, role?: Role) {
    try {
      if (details.confirmpassword !== user.password) {
        throw new AppError("passwords do not match", 400);
      }
      await this.SchemaValidation(user);
      details.confirmpassword = "";
      user.password = await bcrypt.hash(user.password, 12);
      if (role === undefined) {
        let patient = this.assignCommonDetails(
          new Patient(),
          details,
          user,
          Role.Patient
        );
        await this.SchemaValidation(patient);
        await PatientRepository.save(patient);
      } else if (role === Role.Doctor) {
        const doctor = this.assignCommonDetails(
          new Doctor(),
          details,
          user,
          Role.Doctor
        );
        if (!details.schedules || details.schedules?.length === 0) {
          throw new AppError("At least 1 schedule must be provided", 400);
        }
        await this.assignDoctorDetails(doctor, details);
        await this.SchemaValidation(doctor);
        await DoctorRepository.save(doctor);
      } else if (role === Role.Admin) {
        user.role = Role.Admin;
        await UserRepository.save(user);
      }
    } catch (error) {
      throw error;
    }
  }

  public async loginService(email: string, password: string) {
    try {
      if (!email || !password) {
        throw new AppError("Please provide email and password!", 400);
      }
      const user = await UserRepository.findOne({
        select: ["id", "password", "role"],
        where: { email: email },
      });
      if (user === null || !(await bcrypt.compare(password, user.password))) {
        throw new AppError("Incorrect email or password", 401);
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  public async authorizationService(token: any) {
    try {
      if (token === null) {
        throw new AppError(
          "You are not logged in! Please log in to get access.",
          401
        );
      }
      const decoded: any = jwt.verify(token, env.JWT_SECRET);
      const currentUser = await UserRepository.findOne({
        select: ["id", "role"],
        where: { id: decoded.id },
      });
      if (currentUser === null) {
        throw new AppError(
          "The user belonging to this token does no longer exist.",
          401
        );
      }
      return currentUser;
    } catch (error) {
      throw error;
    }
  }

  public authenticationService(
    user: User | undefined,
    roles: Role[] | undefined
  ) {
    if (user === undefined || !roles?.includes(user.role)) {
      throw new AppError(
        "You do not have permission to perform this action",
        403
      );
    }
  }

  public async mailcode(email: string) {
    try {
      if (email === undefined) {
        throw new AppError("did not recieve expected parameters", 400);
      }
      const user = await this.getUser(email);
      if (user === null) {
        throw new AppError("user with that email does not exist", 404);
      }
      var randomize = require("randomatic");
      const code = randomize("0", 5);
      await this.addCodetoDb(code, email);
      await this.sendMail(email, code);
    } catch (error) {
      throw error;
    }
  }
  public async verifyandresetpassword(
    email: string,
    code: string,
    password: string
  ) {
    try {
      if (email === undefined || code === undefined || password === undefined) {
        throw new AppError("did not recieve expected parameters", 400);
      }
      if (password.length < 10) {
        throw new AppError(
          "new password must have length greater than 10",
          400
        );
      }
      const user = await this.getdbcode(email);
      if (user === null) {
        throw new AppError(
          "user with that email does not exist or code expired",
          400
        );
      }
      if (user.mailcode === code) {
        user.password = await bcrypt.hash(password, 12);
        user.validtill = new Date();
        UserRepository.save(user);
      } else {
        throw new AppError("incorrect code", 400);
      }
    } catch (error) {
      throw error;
    }
  }

  public async verifyLoginCode(code?: string) {
    try {
      let email: any = await client.get(`adminEmail`);
      let token: any = await client.get(`adminToken`);
      email = JSON.parse(email);
      token = JSON.parse(token);
      if (code === undefined) {
        throw new AppError("did not recieve expected parameters", 400);
      }
      if (email === null || token === null) {
        throw new AppError("Time limit of 10 minutes passed login again", 400);
      }
      const user = await this.getdbcode(email);
      if (user === null) {
        throw new AppError(
          "user with that email does not exist or code expired",
          400
        );
      }
      if (user.mailcode === code) {
        user.validtill = new Date();
        UserRepository.save(user);
      } else {
        throw new AppError("incorrect code", 400);
      }
      return token;
    } catch (error) {
      throw error;
    }
  }

  public async addToRedis(email: string, token: string) {
    try {
      if (ready) {
        await client.setEx(`adminEmail`, 600, JSON.stringify(email));
        await client.setEx(`adminToken`, 600, JSON.stringify(token));
      }
    } catch (error) {
      throw error;
    }
  }

  public async googleLoginOrSignup(user: any) {
    try {
      let email=user?.profile?._json?.email
      let dbuser=await UserRepository.findOne({
        select: ["id", "password", "role"],
        where: { email: email },
      });
      if(user?.profile?._json?.email_verified){
        if(dbuser===null){
          const _user= new User()
          const _patient=new Patient()
          _patient.name=user?.profile?.displayName
          _user.email=email
          _user.role=Role.Patient
          _patient.gender=Gender.Male
          _patient.phone="03000000000"
          let newpw=`${_user.email}${env.GOOGLE_CLIENT_SECRET}`
          _user.password=await bcrypt.hash(newpw, 12);
          let url = toonavatar.generate_avatar({ gender: "male" });
          _patient.photo = url;
          _patient.user=_user
          await PatientRepository.save(_patient)
          dbuser=await UserRepository.findOne({
            select: ["id", "password", "role"],
            where: { email: email },
          });
        }
        else{
          let pw=`${email}${env.GOOGLE_CLIENT_SECRET}`
          if (!(await bcrypt.compare(pw, dbuser.password))) {
            throw new AppError("Incorrect email or password", 401);
          }
        }
       let token=this.getjwtToken(dbuser!)
       return token;
      }
      else{
        throw new AppError("could not verify email",400)
      }
    } catch (error) {
      throw error;
    }
  }  
}
