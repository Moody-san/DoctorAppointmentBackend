import { Request, Response } from "express";
import { DataBaseErrorHandler } from "./../utils/databaseErrorHandler";
import { CustomRequest } from "./authController";
import { appointmentService } from "./../services/appointmentService";
export class appointmentController {
  private dbErrHandler: DataBaseErrorHandler;
  private appointmentService: appointmentService;
  constructor() {
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

  public makeAppointment = async (req: CustomRequest, res: Response) => {
    try {
      const id = await this.appointmentService.bookappointment(
        req.user?.id,
        req.body?.docid,
        req.body?.scheduleid,
        req.body?.apptdate
      );
      res.status(200).json({
        status: "success",
        id: id,
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };

  public getAppointments = async (req: CustomRequest, res: Response) => {
    try {
      const data = await this.appointmentService.getScheduledappointments(
        req?.user,
        req.query.filter
      );
      res.status(200).json({
        status: "success",
        data: data,
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };

  public getAppointments_Admin = async (req: Request, res: Response) => {
    try {
      const data = await this.appointmentService.getAppts_admin();
      res.status(200).json({
        status: "success",
        data: data,
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };
}
