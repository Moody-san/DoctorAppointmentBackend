import { AppError } from "./../utils/AppError";
import { AppointmentRepository } from "./../repositories/appointmentRepo";

import { Patient } from "./../models/Patient";
import { DoctorSchedule } from "./../models/DoctorSchedule";
import { Role, User } from "./../models/User";
import { Brackets } from "typeorm";

export class appointmentService {
  constructor() {}

  private FilterAppts(appts: any, filter: any) {
    for (let i = 0; i < appts.length; i++) {
      let aptdtstr = appts[i].appointment_aptdate;
      aptdtstr = aptdtstr.split(":").reverse().join("-");
      let apptdate = new Date(aptdtstr);
      let curdate = new Date();
      if (filter === "upcoming") {
        if (curdate.getTime() > apptdate.getTime()) {
          appts.splice(i, 1);
          i--;
        }
      } else if (filter === "passed") {
        if (curdate.getTime() < apptdate.getTime()) {
          appts.splice(i, 1);
          i--;
        }
      }
    }
    return appts;
  }

  public async getAppts_admin() {
    return await AppointmentRepository.createQueryBuilder("appointment")
      .select([
        "appointment.aptdate",
        "appointment.id",
        "doctorschedule.day",
        "doctorschedule.from",
        "doctorschedule.till",
        "doctorschedule.location",
        "doctorschedule.doctorUserId",
        "doctor.name",
        "doctor.photo",
        "patient.name",
        "patient.photo",
      ])
      .innerJoin("appointment.doctorschedule", "doctorschedule")
      .innerJoin("appointment.patient", "patient")
      .innerJoin("doctorschedule.doctor", "doctor")
      .where("appointment.paid =:true", { true: true })
      .getMany();
  }

  private async getAppts(userid: number) {
    return await AppointmentRepository.createQueryBuilder("appointment")
      .select([
        "appointment.aptdate",
        "appointment.id",
        "doctorschedule.day",
        "doctorschedule.from",
        "doctorschedule.till",
        "doctorschedule.location",
        "doctorschedule.doctorUserId",
        "doctor.name",
        "doctor.photo",
        "patient.name",
        "patient.photo",
      ])
      .innerJoin("appointment.doctorschedule", "doctorschedule")
      .innerJoin("appointment.patient", "patient")
      .innerJoin("doctorschedule.doctor", "doctor")
      .where(
        new Brackets((qb) =>
          qb
            .where("appointment.patientUserId = :uid", { uid: userid })
            .andWhere("appointment.paid =:true", { true: true })
        )
      )
      .orWhere(
        new Brackets((qb) =>
          qb
            .where("appointment.doctorscheduleDoctorUserId = :uid", {
              uid: userid,
            })
            .andWhere("appointment.paid =:true", { true: true })
        )
      )
      .getRawMany();
  }

  private async removeunpaidappts(patientid: number) {
    await AppointmentRepository.createQueryBuilder("appointment")
      .delete()
      .where("patientUserId = :id", { id: patientid })
      .andWhere("appointment.paid =:false", { false: false })
      .execute();
  }

  public async NoofAppointments() {
    try {
      let appts = await AppointmentRepository.createQueryBuilder("appointment")
        .select("COUNT(*)", "COUNT")
        .where("appointment.paid =:true", { true: true })
        .getRawMany();
      return appts;
    } catch (error) {
      throw error;
    }
  }

  public bookappointment = async (
    patientid?: number,
    doctorid?: number,
    scheduleid?: number,
    apptdate?: string
  ) => {
    try {
      if (
        patientid === undefined ||
        doctorid === undefined ||
        scheduleid === undefined ||
        apptdate === undefined
      ) {
        throw new AppError("did not recieve expected parameters", 400);
      }
      await this.removeunpaidappts(patientid);
      const patient = new Patient();
      patient.userId = patientid;
      const doctorschedule = new DoctorSchedule();
      doctorschedule.doctorUserId = doctorid;
      doctorschedule.scheduleid = scheduleid;
      await AppointmentRepository.createQueryBuilder()
        .insert()
        .values([
          {
            aptdate: apptdate,
            patient: patient,
            doctorschedule: doctorschedule,
          },
        ])
        .execute();
      return await AppointmentRepository.findOne({
        select: ["id"],
        where: {
          aptdate: apptdate,
          patient: patient,
          doctorschedule: doctorschedule,
        },
      });
    } catch (error) {
      throw error;
    }
  };

  public getScheduledappointments = async (user?: User, filter?: any) => {
    try {
      if (user === undefined || null) {
        throw new AppError("user not found", 400);
      }
      let appt = [];
      appt = await this.getAppts(user.id);
      if (filter === "upcoming") {
        return this.FilterAppts(appt, filter);
      } else if (filter === "passed") {
        return this.FilterAppts(appt, filter);
      } else {
        return appt;
      }
    } catch (error) {
      throw error;
    }
  };
}
