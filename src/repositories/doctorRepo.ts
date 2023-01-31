import { AppDataSource } from "./../dbconfig";
import { Doctor } from "./../models/Doctor";

export const DoctorRepository = AppDataSource.getRepository(Doctor).extend({
  doctorSelectionArray() {
    return [
      "doctor.userId",
      "doctor.name",
      "doctor.photo",
      "doctor.gender",
      "doctor.phone",
      "doctor.sessionfee",
      "doctor.qualifications",
      "doctor.rating",
      "doctor.specializedtreatments",
      "doctorschedule.scheduleid",
      "doctorschedule.location",
      "doctorschedule.latitude",
      "doctorschedule.longitude",
      "doctorschedule.day",
      "doctorschedule.from",
      "doctorschedule.till",
    ];
  },
  async nextday(day: number) {
    return await this.query(
      `select TO_CHAR(('TOMORROW'::date +(${day}+7- extract(dow from 'TOMORROW'::date))::int%7),'dd:mm:yyyy') as date`
    );
  },
});
