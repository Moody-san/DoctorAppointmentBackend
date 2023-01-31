import { Router } from "express";
import { Role } from "./../models/User";
import { appointmentController } from "./../controllers/appointmentController";
import { AuthController } from "./../controllers/authController";

export class appointmentRouter {
  public router: Router;
  private appointmentController: appointmentController;
  private authController: AuthController;
  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.appointmentController = new appointmentController();
    this.routes();
  }

  private routes() {
    this.router.post(
      "/bookappointment",
      this.authController.authorization,
      this.authController.authentication(Role.Patient),
      this.appointmentController.makeAppointment
    );
    this.router.get(
      "/getappointments",
      this.authController.authorization,
      this.authController.authentication(Role.Patient, Role.Doctor),
      this.appointmentController.getAppointments
    );
  }
}
