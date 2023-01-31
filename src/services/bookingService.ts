import { AppError } from "./../utils/AppError";
import { BookingRepository } from "./../repositories/bookingRepo";
import { DoctorRepository } from "./../repositories/doctorRepo";
import { UserRepository } from "./../repositories/userRepo";
import env from "./../../config";
import { AppointmentRepository } from "./../repositories/appointmentRepo";
export class BookingService {
  constructor() {}

  private getDoctor = async (doctorid: number) => {
    const data = await DoctorRepository.createQueryBuilder("doctor")
      .select(["doctor.sessionfee","user.email"])
      .innerJoin("doctor.user", "user")
      .where("doctor.userId = :uid", {
        uid: doctorid,
      })
      .getOne();
    if (data === null) {
      throw new AppError("Doctor does not exist", 404);
    } else {
      return data;
    }
  };

  private getMail = async (userid: any) => {
    const data = await UserRepository.createQueryBuilder("user")
      .select(["user.email"])
      .where("user.id = :uid", {
        uid: userid,
      })
      .getOne();
    if (data === null) {
      throw new AppError("User does not exist", 404);
    } else {
      return data;
    }
  };

  private getDate = async (aptid: any) => {
    const data = await AppointmentRepository.createQueryBuilder("appointment")
      .select(["appointment.aptdate"])
      .where("appointment.id = :id", {
        id: aptid,
      })
      .getOne();
    if (data === null) {
      throw new AppError(
        "Appointment has been interrupted please try to book again",
        500
      );
    } else {
      return data;
    }
  };

  public async MoneyEarned() {
    try {
      let appts = await BookingRepository.createQueryBuilder("booking")
      .select("SUM(booking.paidAmount)", "SUM")
      .getRawMany();
      return appts;
    } catch (error) {
      throw error;
    }
  }

  public bookingService = async (
    doctorid: number,
    tokenid: string,
    userid: any,
    appointmentid: number
  ) => {
    try {
      if (
        doctorid === undefined ||
        tokenid === undefined ||
        userid === undefined ||
        appointmentid === undefined
      ) {
        throw new AppError("did not recieve expected parameters", 400);
      }
      const {user:{email:doctoremail},sessionfee:doctorfee} = await this.getDoctor(doctorid);
      const {email:patientemail} = await this.getMail(userid);
      const {aptdate:apptdate} = await this.getDate(appointmentid);
      const stripe = require("stripe")(env.STRIPE_SECRET);
      const charge = await stripe.charges.create({
        amount: doctorfee*100,
        currency: "usd",
        source: tokenid,
        receipt_email: patientemail,
        description: `Get the appointment from best doctor in town for just ${doctorfee}`,
      });
      if (charge.paid === true) {
        await BookingRepository.createQueryBuilder()
          .insert()
          .values([
            {
              patientmail: patientemail,
              doctormail: doctoremail,
              paidAmount: doctorfee,
              aptdate: apptdate,
            },
          ])
          .execute();
        await AppointmentRepository.createQueryBuilder("appointment")
          .update()
          .set({ paid: true })
          .where("appointment.id = :id", { id: appointmentid })
          .execute();
      }
    } catch (error) {
      throw error;
    }
  };
}
