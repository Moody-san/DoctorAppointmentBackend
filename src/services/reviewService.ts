import { Doctor } from "./../models/Doctor";
import { Patient } from "./../models/Patient";
import { ReviewRepository } from "./../repositories/reviewRepo";
import { AppError } from "./../utils/AppError";
import { DoctorRepository } from "./../repositories/doctorRepo";

export class reviewService {
  constructor() {}

  private CheckReviewDate(aptdate: string) {
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

  async updateRating(doctorid: number) {
    try {
      let result = await ReviewRepository.createQueryBuilder("review")
        .select("AVG(review.stars)", "AVG")
        .where("review.doctorUserId = :uid", {
          uid: doctorid,
        })
        .getRawMany();

      await DoctorRepository.createQueryBuilder("doctor")
        .update()
        .set({ rating: () => `ROUND(${result[0].AVG})` })
        .where("userId = :id", { id: doctorid })
        .execute();
    } catch (error) {
      console.log(error);
      throw new AppError(`could not update review ${error}`, 500);
    }
  }

  private async getReviews(userid: number) {
    return await ReviewRepository.createQueryBuilder("review")
      .select(["review.stars", "review.reviewdate", "review.reviewtext"])
      .where("review.doctorUserId = :uid", {
        uid: userid,
      })
      .getRawMany();
  }

  public addDocReview = async (
    patientid: any,
    doctorid: any,
    stars: any,
    aptdate: any,
    text: any
  ) => {
    try {
      if (
        patientid === undefined ||
        doctorid === undefined ||
        stars === undefined ||
        aptdate === undefined ||
        text === undefined
      ) {
        throw new AppError("did not recieve expected parameters", 400);
      }
      const currdate = this.CheckReviewDate(aptdate);
      if (currdate === null) {
        throw new AppError("Appointment date has not yet passed", 400);
      }
      const patient = new Patient();
      patient.userId = patientid;
      const doctor = new Doctor();
      doctor.userId = doctorid;
      await ReviewRepository.createQueryBuilder()
        .insert()
        .values([
          {
            reviewdate: currdate,
            patient: patient,
            doctor: doctor,
            stars: stars,
            reviewtext: text,
          },
        ])
        .execute();
      await this.updateRating(doctorid);
    } catch (error) {
      throw error;
    }
  };

  public getDocReview = async (doctorid: any) => {
    try {
      if (doctorid === undefined || null) {
        throw new AppError("did not recieve expected parameters", 400);
      }
      let reviews = [];
      reviews = await this.getReviews(doctorid);
      return reviews;
    } catch (error) {
      throw error;
    }
  };
}
