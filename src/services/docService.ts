import { AppError } from "./../utils/AppError";
import { DoctorRepository } from "./../repositories/doctorRepo";
import { Doctor } from "./../models/Doctor";
import { DoctorSchedule } from "./../models/DoctorSchedule";
import { DoctorScheduleRepository } from "./../repositories/doctorScheduleRepo";
import { Role } from "./../models/User";
import { AppointmentRepository } from "./../repositories/appointmentRepo";
export class docService {
  constructor() {}
  private getDistance = (arr1: any, arr2: any) => {
    if (arr1 && arr2) {
      var p = 0.017453292519943295; // Math.PI / 180
      var c = Math.cos;
      var a =
        0.5 -
        c((arr2[0] - arr1[0]) * p) / 2 +
        (c(arr1[0] * p) * c(arr2[0] * p) * (1 - c((arr2[1] - arr1[1]) * p))) /
          2;

      return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
    } else {
      throw new AppError("Provide two sets of coordinates please.", 400);
    }
  };

  private getdaynum(day: string) {
    switch (day) {
      case "sunday":
        return 0;

      case "monday":
        return 1;

      case "tuesday":
        return 2;

      case "wednesday":
        return 3;

      case "thursday":
        return 4;

      case "friday":
        return 5;

      case "saturday":
        return 6;

      default:
        throw new AppError("invalid day of schedule", 400);
    }
  }

  private async getDocScheduleDate(doctor: Doctor) {
    for (let i = 0; i < doctor.doctorschedule.length; i++) {
      let day = this.getdaynum(doctor.doctorschedule[i].day);
      let d1 = await DoctorRepository.nextday(day);
      if (
        await this.checkApptTable(
          doctor.userId,
          doctor.doctorschedule[i].scheduleid,
          d1[0].date
        )
      )
        doctor.doctorschedule[i].availabledate = d1[0].date;
      else {
        doctor.doctorschedule.splice(i, 1);
        i--;
      }
    }
  }

  private async checkApptTable(
    doctorid: any,
    doctorscheduleid: any,
    date: any
  ) {
    let result = await DoctorScheduleRepository.createQueryBuilder(
      "doctorschedule"
    )
      .select("COUNT(*)", "COUNT")
      .innerJoin("doctorschedule.appointment", "appointment")
      .where("appointment.doctorscheduleScheduleid = :sid", {
        sid: doctorscheduleid,
      })
      .andWhere("appointment.doctorscheduleDoctorUserId = :did", {
        did: doctorid,
      })
      .andWhere("appointment.aptdate = :date", { date: date })
      .andWhere("appointment.paid = :true", { true: true })
      .getRawMany();
    //get max appt
    const max_appt = await this.getMaxAppointments(doctorid, doctorscheduleid);
    if (
      max_appt?.maxappointments !== undefined &&
      +result[0].COUNT < max_appt?.maxappointments
    ) {
      return true;
    } else {
      return false;
    }
  }

  private async getMaxAppointments(doctorid: any, doctorscheduleid: any) {
    return await DoctorScheduleRepository.createQueryBuilder("doctorschedule")
      .select("doctorschedule.maxappointments")
      .where("doctorschedule.scheduleid = :sid", {
        sid: doctorscheduleid,
      })
      .andWhere("doctorschedule.doctorUserId = :did", {
        did: doctorid,
      })
      .getOne();
  }

  public async NoofDoctors() {
    try {
      let docs = await DoctorRepository.createQueryBuilder("doctor")
        .select("COUNT(*)", "COUNT")
        .getRawMany();
      return docs;
    } catch (error) {
      throw error;
    }
  }
  public async getdocs_admin() {
    return await DoctorRepository.createQueryBuilder("doctor")
      .select([
        "doctor.userId",
        "doctor.name",
        "doctor.photo",
        "doctor.gender",
        "doctor.phone",
        "doctor.sessionfee",
        "doctor.qualifications",
        "doctor.rating",
        "user.email",
      ])
      .innerJoin("doctor.user", "user")
      .orderBy("doctor.rating")
      .getRawMany();
  }
  public async getDoctors(page: any, limit: any) {
    try {
      let p: number = +page || 1;
      let l: number = +limit || 100;
      let s: number = (p - 1) * l;
      let doctors = [];
      doctors = await DoctorRepository.createQueryBuilder("doctor")
        .select(DoctorRepository.doctorSelectionArray())
        .innerJoin("doctor.doctorschedule", "doctorschedule")
        .skip(s)
        .take(l)
        .getMany();
      return doctors;
    } catch (error) {
      throw error;
    }
  }

  public async getDoctor(id: string) {
    try {
      if (id === undefined) {
        throw new AppError("bad request no doctor id provided", 400);
      }
      let Id = parseInt(id);
      if (isNaN(Id)) {
        throw new AppError("Invalid id " + id, 400);
      }
      let doctor: any = await DoctorRepository.createQueryBuilder("doctor")
        .select(DoctorRepository.doctorSelectionArray())
        .innerJoin("doctor.doctorschedule", "doctorschedule")
        .where("doctor.userId=:id", { id: Id })
        .getOne();
      if (doctor === null) {
        throw new AppError("doctor not found", 404);
      }
      await this.getDocScheduleDate(doctor);
      return doctor;
    } catch (error) {
      throw error;
    }
  }

  public async getDocMoneyEarned(id: string) {
    try {
      if (id === undefined) {
        throw new AppError("bad request no doctor id provided", 400);
      }
      let Id = parseInt(id);
      if (isNaN(Id)) {
        throw new AppError("Invalid id " + id, 400);
      }
      let doctor: any = await AppointmentRepository.createQueryBuilder(
        "appointment"
      )
        .select("SUM(doctor.sessionfee)", "SUM")
        .innerJoin("appointment.doctorschedule", "doctorschedule")
        .innerJoin("doctorschedule.doctor", "doctor")
        .where("appointment.doctorscheduleDoctorUserId=:id", { id: Id })
        .andWhere("appointment.paid =:true", { true: true })
        .getRawMany();
      if (doctor === null) {
        throw new AppError("doctor not found", 404);
      }
      return doctor;
    } catch (error) {
      throw error;
    }
  }

  public NearbyDocs = async (latitude: any, longitude: any, distance: any) => {
    try {
      if (latitude === undefined || longitude === undefined) {
        throw new AppError("Unable to get your location(lat,long)", 400);
      }
      let lat = +latitude;
      let long = +longitude;
      let dist = +distance || 100;
      let nearbyDocs: Doctor[] = [];
      const doctors = await DoctorRepository.createQueryBuilder("doctor")
        .select(DoctorRepository.doctorSelectionArray())
        .innerJoin("doctor.doctorschedule", "doctorschedule")
        .getMany();
      doctors.forEach((doctor) => {
        let insertdocflag = false;
        let newdocschedule: DoctorSchedule[] = [];
        doctor.doctorschedule.forEach((doctorschedule) => {
          let qlat = +doctorschedule.latitude;
          let qlong = +doctorschedule.longitude;
          let d = this.getDistance([lat, long], [qlat, qlong]);
          if (d <= dist) {
            insertdocflag = true;
            newdocschedule.push(doctorschedule);
          }
        });
        if (insertdocflag) {
          doctor.doctorschedule = newdocschedule;
          nearbyDocs.push(doctor);
        }
      });
      return nearbyDocs;
    } catch (error) {
      throw error;
    }
  };
  public async getdocbyname_admin(name: any) {
    if (name === undefined) {
      throw new AppError("not found", 400);
    }
    return await DoctorRepository.createQueryBuilder("doctor")
      .select([
        "doctor.userId",
        "doctor.name",
        "doctor.photo",
        "doctor.gender",
        "doctor.phone",
        "doctor.sessionfee",
        "doctor.qualifications",
        "doctor.rating",
        "user.email",
      ])
      .innerJoin("doctor.user", "user")
      .where("LOWER(doctor.name) like :name", {
        name: `%${name.toLowerCase()}%`,
      })
      .orderBy("doctor.rating")
      .getRawMany();
  }
  public async getDoctorByName(name: any) {
    try {
      if (name === undefined) {
        throw new AppError("not found", 400);
      }
      let doctors = await DoctorRepository.createQueryBuilder("doctor")
        .select(DoctorRepository.doctorSelectionArray())
        .innerJoin("doctor.doctorschedule", "doctorschedule")
        .where("LOWER(doctor.name) like :name", {
          name: `%${name.toLowerCase()}%`,
        })
        .orderBy("doctor.rating")
        .getMany();
      return doctors;
    } catch (error) {
      throw error;
    }
  }
}
