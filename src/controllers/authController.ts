import { Response, Request, NextFunction } from "express";
import { Role, User } from "./../models/User";
import { DataBaseErrorHandler } from "./../utils/databaseErrorHandler";
import { AuthService } from "./../services/authService";
import { AppError } from "./../utils/AppError";
export type CustomRequest = Request & { user?: User|any };
export class AuthController {
  private authservice: AuthService;
  private dbErrHandler: DataBaseErrorHandler;
  constructor() {
    this.authservice = new AuthService();
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

  public signup = (role?: Role) => {
    return async (req: Request, res: Response) => {
      try {
        const user = new User();
        user.email = req.body.email;
        user.password = req.body.password;
        let details = req.body;
        await this.authservice.registerUserService(user, details, role);
        res.status(201).json({
          status: "success",
        });
      } catch (error) {
        this.errorResponse(error, res);
      }
    };
  };
  public login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await this.authservice.loginService(email, password);
      if(user.role===Role.Admin){
        throw new AppError("Not authorized!", 400);
      }
      const token = this.authservice.getjwtToken(user!);
      res.status(200).json({
        status: "success",
        token: token,
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };

  public sendLoginCode = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await this.authservice.loginService(email, password);
      if(user.role!==Role.Admin){
        throw new AppError("Not authorized!", 400);
      }
      const token = await this.authservice.getjwtToken(user!);
      await this.authservice.mailcode(email);
      await this.authservice.addToRedis(email, token);
      res.status(200).json({
        status: "success",
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };

  public loginadmin = async (req: Request, res: Response) => {
    try {
      const token = await this.authservice.verifyLoginCode(req.body.code);
      res.status(200).json({
        status: "success",
        token: token,
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };

  public authorization = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let token;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        token = req.headers.authorization.split(" ")[1];
      }
      const user = await this.authservice.authorizationService(token);
      req.user = user;
      next();
    } catch (error) {
      this.errorResponse(error, res);
    }
  };
  public authentication = (...roles: Role[]) => {
    return (req: CustomRequest, res: Response, next: NextFunction) => {
      try {
        this.authservice.authenticationService(req.user, roles);
        next();
      } catch (error) {
        this.errorResponse(error, res);
      }
    };
  };

  public sendCode = async (req: Request, res: Response) => {
    try {
      await this.authservice.mailcode(req.body?.email);
      res.status(200).json({
        status: "success",
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };

  public resetPassword = async (req: Request, res: Response) => {
    try {
      await this.authservice.verifyandresetpassword(
        req.body?.email,
        req.body?.code,
        req.body?.password
      );
      res.status(200).json({
        status: "success",
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };

  public google = async (req: any ,res: Response<any, Record<string, any>> ) => {
    try {
      const token=await this.authservice.googleLoginOrSignup(
        req.user,
      );
      res.status(200).json({
        status: "success",
        token
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };

}
