import { Router } from "express";
import { Role } from "./../models/User";
import { BookingController } from "./../controllers/bookingController";
import { AuthController } from "./../controllers/authController";

export class BookingRouter {
  public router: Router;
  private bookingController: BookingController;
  private authController: AuthController;
  constructor() {
    this.router = Router();
    this.bookingController = new BookingController();
    this.authController = new AuthController();
    this.routes();
  }

  private routes() {
    this.router.post(
      "/addnewbooking",
      this.authController.authorization,
      this.authController.authentication(Role.Patient),
      this.bookingController.addBooking
    );
  }
}
