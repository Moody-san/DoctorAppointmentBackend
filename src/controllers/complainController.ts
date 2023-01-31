import { Response } from "express";
import { DataBaseErrorHandler } from "./../utils/databaseErrorHandler";
import { CustomRequest } from "./authController";
import { ComplainService } from "./../services/complainService";
export class ComplainController {
  private dbErrHandler: DataBaseErrorHandler;
  private complainService: ComplainService;
  constructor() {
    this.complainService = new ComplainService();
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

  public addComplain = async (req: CustomRequest, res: Response) => {
    try {
      await this.complainService.addDoccomplain(
        req.body?.appointmentid,
        req.body?.reason,
        req.body?.description,
        req.body?.aptdate
      );
      res.status(200).json({
        status: "success",
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };

  public getComplains = async (req: CustomRequest, res: Response) => {
    try {
      let data = await this.complainService.getDoccomplains();
      res.status(200).json({
        status: "success",
        data,
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };

  public deleteComplain = async (req: CustomRequest, res: Response) => {
    try {
      await this.complainService.deleteDoccomplain(req.params?.aptid);
      res.status(200).json({
        status: "success",
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };
}
