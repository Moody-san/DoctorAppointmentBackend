import { Response, Request } from "express";
import { DataBaseErrorHandler } from "./../utils/databaseErrorHandler";
import { CustomRequest } from "./authController";
import { userService } from "./../services/userService";
export class userController {
  private dbErrHandler: DataBaseErrorHandler;
  private userService: userService;
  constructor() {
    this.userService = new userService();
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

  public getCurrentUser = async (req: CustomRequest, res: Response) => {
    try {
      let data = await this.userService.getUserData(
        req.user?.id,
        req.user?.role
      );
      res.status(200).json({
        status: "success",
        data: data,
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };

  public deleteUser = async (req: Request, res: Response) => {
    try {
      await this.userService.deleteById(req.params.id);
      res.status(200).json({
        status: "success",
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };

  public changePassword = async (req: CustomRequest, res: Response) => {
    try {
      await this.userService.changeUserPw(
        req.body?.oldpw,
        req.body?.newpwconfirm,
        req.body?.newpw,
        req.user?.id
      );
      res.status(200).json({
        status: "success",
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };

  public updateProfile = async (req: CustomRequest, res: Response) => {
    try {
      await this.userService.ChangeInfo(
        req.body?.property,
        req.body?.value,
        req.user?.role,
        req.user?.id
      );
      res.status(200).json({
        status: "success",
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };
}
