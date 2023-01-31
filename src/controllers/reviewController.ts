import { Response, Request } from "express";
import { DataBaseErrorHandler } from "./../utils/databaseErrorHandler";
import { CustomRequest } from "./authController";
import { reviewService } from "./../services/reviewService";
export class reviewController {
  private dbErrHandler: DataBaseErrorHandler;
  private reviewService: reviewService;
  constructor() {
    this.reviewService = new reviewService();
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

  public addReview = async (req: CustomRequest, res: Response) => {
    try {
      await this.reviewService.addDocReview(
        req.user?.id,
        req.body?.doctorid,
        req.body?.stars,
        req.body?.apptdate,
        req.body?.text
      );
      res.status(200).json({
        status: "success",
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };

  public getDoctorReview = async (req: Request, res: Response) => {
    try {
      let data = await this.reviewService.getDocReview(req.params?.id);
      res.status(200).json({
        status: "success",
        data: data,
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };
}
