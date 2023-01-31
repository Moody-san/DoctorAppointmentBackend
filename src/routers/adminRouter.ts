import { Router } from "express";
import { Role } from "./../models/User";
import { AuthController } from "./../controllers/authController";
import { userController } from "./../controllers/userController";
import { patientController } from "./../controllers/patientController";
import { docController } from "./../controllers/docController";
import { adminController } from "./../controllers/adminController";
import { appointmentController } from "./../controllers/appointmentController";

export class adminRouter {
  public router: Router;
  private authController: AuthController;
  private userController: userController;
  private patientController: patientController;
  private adminController: adminController;
  private appointmentController: appointmentController;
  private docController: docController;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.userController = new userController();
    this.patientController = new patientController();
    this.adminController = new adminController();
    this.appointmentController = new appointmentController();
    this.docController = new docController();
    this.routes();
  }

  private routes() {
    this.router.post(
      "/createdoctor",
      this.authController.authorization,
      this.authController.authentication(Role.Admin),
      this.authController.signup(Role.Doctor)
    );
    this.router.post(
      "/createadmin",
      this.authController.authorization,
      this.authController.authentication(Role.Admin),
      this.authController.signup(Role.Admin)
    );
    this.router.delete(
      "/deleteuser/:id",
      this.authController.authorization,
      this.authController.authentication(Role.Admin),
      this.userController.deleteUser
    );
    this.router.get(
      "/getallpatients",
      this.authController.authorization,
      this.authController.authentication(Role.Admin),
      this.patientController.getAllPatients
    );
    this.router.get(
      "/getallappts",
      this.authController.authorization,
      this.authController.authentication(Role.Admin),
      this.appointmentController.getAppointments_Admin
    );
    this.router.get(
      "/getalldocs",
      this.authController.authorization,
      this.authController.authentication(Role.Admin),
      this.docController.getAllDoctors_admin
    );
    this.router.get(
      "/searchdoc",
      this.authController.authorization,
      this.authController.authentication(Role.Admin),
      this.docController.getDocByName_admin
    );
    this.router.get(
      "/getadminstats",
      this.authController.authorization,
      this.authController.authentication(Role.Admin),
      this.adminController.getstats
    );
    this.router.get(
      "/searchpatient",
      this.authController.authorization,
      this.authController.authentication(Role.Admin),
      this.patientController.getPatientByName
    );
  }
}
