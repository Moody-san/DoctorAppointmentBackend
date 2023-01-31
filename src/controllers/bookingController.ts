import { Response } from "express";
import { DataBaseErrorHandler } from "./../utils/databaseErrorHandler";
import { CustomRequest } from "./authController";
import { BookingService } from "./../services/bookingService";
export class BookingController {
  private dbErrHandler: DataBaseErrorHandler;
  private bookingService: BookingService;
  constructor() {
    this.bookingService = new BookingService();
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

  public addBooking = async (req: CustomRequest, res: Response) => {
    try {
      const data = await this.bookingService.bookingService(
        req.body?.doctorid,
        req.body?.tokenid,
        req.user?.id,
        req.body?.appointmentid
      );
      res.status(200).json({
        status: "success",
        data: data,
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };
}
