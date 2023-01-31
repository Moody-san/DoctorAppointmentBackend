import { Response, Request } from "express";
import { DataBaseErrorHandler } from "./../utils/databaseErrorHandler";
import { docService } from "./../services/docService";
import { CustomRequest } from "./authController";
export class docController {
  private dbErrHandler: DataBaseErrorHandler;
  private docService: docService;
  constructor() {
    this.docService = new docService();
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

  public getAllDoctors = async (req: Request, res: Response) => {
    try {
      const doctors = await this.docService.getDoctors(
        req.query.page,
        req.query.limit
      );
      res.status(200).json({
        status: "success",
        data: doctors,
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };

  public getAllDoctors_admin = async (req: Request, res: Response) => {
    try {
      const doctors = await this.docService.getdocs_admin();
      res.status(200).json({
        status: "success",
        data: doctors,
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };

  public findDoctorsNearby = async (req: Request, res: Response) => {
    try {
      const doctors = await this.docService.NearbyDocs(
        req.query.lat,
        req.query.lon,
        req.query.distance
      );
      res.status(200).json({
        status: "success",
        data: doctors,
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };

  public getDocById = async (req: Request, res: Response) => {
    try {
      let data = await this.docService.getDoctor(req.params?.id);
      res.status(200).json({
        status: "success",
        data: data,
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };

  public getdocincome = async (req: Request, res: Response) => {
    try {
      let data = await this.docService.getDocMoneyEarned(req.params?.id);
      res.status(200).json({
        status: "success",
        data: data,
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };

  public getDocByName = async (req: Request, res: Response) => {
    try {
      let data = await this.docService.getDoctorByName(req.query.name);
      res.status(200).json({
        status: "success",
        data: data,
      });
    } catch (error) {
      console.log(error);
      this.errorResponse(error, res);
    }
  };
  public getDocByName_admin = async (req: Request, res: Response) => {
    try {
      let data = await this.docService.getdocbyname_admin(req.query.name);
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
