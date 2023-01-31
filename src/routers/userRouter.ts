import { Router } from "express";
import { Role } from "./../models/User";
import passport from 'passport'
import { AuthController } from "./../controllers/authController";
import { userController } from "./../controllers/userController";
export class userRouter {
  public router: Router;
  private authController: AuthController;
  private userController: userController;
  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.userController = new userController();
    this.routes();
  }

  private routes() {
    this.router.post("/signup", this.authController.signup());
    this.router.post("/login", this.authController.login);
    this.router.post("/maillogincode", this.authController.sendLoginCode);
    this.router.post("/loginadmin", this.authController.loginadmin);
    this.router.post("/mailresetcode", this.authController.sendCode);
    this.router.post("/resetpassword", this.authController.resetPassword);
    this.router.get("/google",passport.authenticate('google'));
    this.router.get("/google/redirect",passport.authenticate('google',{session:false}),this.authController.google);
    this.router.post(
      "/changepassword",
      this.authController.authorization,
      this.authController.authentication(Role.Doctor, Role.Patient, Role.Admin),
      this.userController.changePassword
    );
    this.router.get(
      "/curuserinfo",
      this.authController.authorization,
      this.authController.authentication(Role.Doctor, Role.Patient, Role.Admin),
      this.userController.getCurrentUser
    );
    this.router.post(
      "/change",
      this.authController.authorization,
      this.authController.authentication(Role.Doctor, Role.Patient),
      this.userController.updateProfile
    );
  }
}
