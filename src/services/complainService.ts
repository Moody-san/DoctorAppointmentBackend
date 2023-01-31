import { AppError } from "./../utils/AppError";
import { ComplainRepository } from "./../repositories/complainRepo";
export class ComplainService {
  constructor() {}

  private CheckComplainDate(aptdate: string) {
    var stringDate = aptdate.split(":");
    var appointmentDate = new Date(
      +stringDate[2],
      +stringDate[1] - 1,
      +stringDate[0]
    );
    let currdate = new Date();
    let result = currdate.valueOf() - appointmentDate.valueOf();
    if (result > 0) {
      return currdate.toLocaleDateString().split("/").join(":");
    }
    return null;
  }

  public addDoccomplain = async (
    appointmentid?: number,
    reason?: string,
    description?: string,
    aptdate?: any
  ) => {
    try {
      if (
        appointmentid === undefined ||
        reason === undefined ||
        description === undefined ||
        aptdate === undefined
      ) {
        throw new AppError("did not recieve expected parameters", 400);
      }
      const currdate = this.CheckComplainDate(aptdate);
      if (currdate === null) {
        throw new AppError("Appointment date has not yet passed", 400);
      }
      await ComplainRepository.createQueryBuilder()
        .insert()
        .values([
          {
            appointmentId: appointmentid,
            reason: reason,
            description: description,
          },
        ])
        .execute();
    } catch (error) {
      throw error;
    }
  };

  public getDoccomplains = async () => {
    try {
      return await ComplainRepository.createQueryBuilder("complain")
        .select([
          "complain.appointmentId",
          "complain.reason",
          "complain.description",
          "doctor.name",
          "doctor.photo",
          "doctor.userId",
          "patient.name",
          "patient.photo",
        ])
        .innerJoin("complain.appointment", "appointment")
        .innerJoin("appointment.doctorschedule", "doctorschedule")
        .innerJoin("appointment.patient", "patient")
        .innerJoin("doctorschedule.doctor", "doctor")
        .getRawMany();
    } catch (error) {
      throw error;
    }
  };

  public deleteDoccomplain = async (id: string) => {
    try {
      let Id = parseInt(id);
      await ComplainRepository.delete({ appointmentId: Id });
    } catch (error) {
      throw error;
    }
  };
}
