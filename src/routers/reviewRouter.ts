import { Router } from "express";
import { Role } from "./../models/User";
import { reviewController } from "./../controllers/reviewController";
import { AuthController } from "./../controllers/authController";

export class reviewRouter {
  public router: Router;
  private reviewController: reviewController;
  private authController: AuthController;
  constructor() {
    this.router = Router();
    this.reviewController = new reviewController();
    this.authController = new AuthController();
    this.routes();
  }

  private routes() {
    this.router.post(
      "/adddoctorreview",
      this.authController.authorization,
      this.authController.authentication(Role.Patient),
      this.reviewController.addReview
    );
    this.router.get(
      "/getdoctorreview/:id",
      this.reviewController.getDoctorReview
    );
  }
}
