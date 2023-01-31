import { Router } from "express";
import { Role } from "./../models/User";
import { ComplainController } from "./../controllers/complainController";
import { AuthController } from "./../controllers/authController";

export class ComplainRouter {
  public router: Router;
  private ComplainController: ComplainController;
  private authController: AuthController;
  constructor() {
    this.router = Router();
    this.ComplainController = new ComplainController();
    this.authController = new AuthController();
    this.routes();
  }

  private routes() {
    this.router.post(
      "/adddoctorcomplain",
      this.authController.authorization,
      this.authController.authentication(Role.Patient),
      this.ComplainController.addComplain
    );
    this.router.get(
      "/getdoctorcomplains",
      this.authController.authorization,
      this.authController.authentication(Role.Admin),
      this.ComplainController.getComplains
    );
    this.router.delete(
      "/deletedoctorcomplain/:aptid",
      this.authController.authorization,
      this.authController.authentication(Role.Admin),
      this.ComplainController.deleteComplain
    );
  }
}
