import { Response, Request } from "express";
import { DataBaseErrorHandler } from "./../utils/databaseErrorHandler";
import { patientService } from "./../services/patientService";
export class patientController {
  private dbErrHandler: DataBaseErrorHandler;
  private patientService: patientService;
  constructor() {
    this.patientService = new patientService();
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

  public getAllPatients = async (req: Request, res: Response) => {
    try {
      const patients = await this.patientService.getPatients(
        req.query.page,
        req.query.limit
      );
      res.status(200).json({
        status: "success",
        data: patients,
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };

  public getPatientByName = async (req: Request, res: Response) => {
    try {
      let data = await this.patientService.findPatientByName(req.query.name);
      res.status(200).json({
        status: "success",
        data: data,
      });
    } catch (error) {
      console.log(error);
      this.errorResponse(error, res);
    }
  };
}
