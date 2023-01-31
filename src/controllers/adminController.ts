import { Response, Request } from "express";
import { DataBaseErrorHandler } from "./../utils/databaseErrorHandler";
import { patientService } from "./../services/patientService";
import { docService } from "./../services/docService";
import { BookingService } from "./../services/bookingService";
import { appointmentService } from "./../services/appointmentService";

export class adminController {
  private dbErrHandler: DataBaseErrorHandler;
  private patientService: patientService;
  private docService: docService;
  private BookingService: BookingService;
  private appointmentService: appointmentService;

  constructor() {
    this.patientService = new patientService();
    this.docService = new docService();
    this.BookingService = new BookingService();
    this.appointmentService = new appointmentService();
    this.dbErrHandler = new DataBaseErrorHandler();
  }
  private errorResponse = (error: any, res: Response) => {
    if ("code" in error) {
      error = this.dbErrHandler.errorParser(error);
    }
    res.status(error.statusCode || 400).json({
      status: "error",
      error: error.message || error,
    });
  };

  public getstats = async (req: Request, res: Response) => {
    try {
      const patient_cnt = await this.patientService.NoofPatients();
      const doctor_cnt = await this.docService.NoofDoctors();
      const appointment_cnt = await this.appointmentService.NoofAppointments();
      const money_earned = await this.BookingService.MoneyEarned();
      res.status(200).json({
        status: "success",
        data: {patient_cnt,doctor_cnt,appointment_cnt,money_earned},
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };
}