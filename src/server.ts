import env from "./../config";
import express from "express";
import { AppDataSource } from "./dbconfig";
import passport from "passport";
import { userRouter } from "./routers/userRouter";
import { adminRouter } from "./routers/adminRouter";
import { docRouter } from "./routers/doctorRouter";
import { reviewRouter } from "./routers/reviewRouter";
import cors from "cors";
import { appointmentRouter } from "./routers/appointmentRouter";
import { ComplainRouter } from "./routers/complainRouter";
import { BookingRouter } from "./routers/bookingRouter";
import { BlogRouter } from "./routers/blogRouter";
import { sent } from "./services/cronjob";

require("./strategies/google");
const ratelimit = require("express-rate-limit");
const limiter = ratelimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "TOO MANY REQUESTS FROM SAME IP",
});
class Server {
  private app: express.Application;
  private userRouter: userRouter;
  private adminRouter: adminRouter;
  private docRouter: docRouter;
  private appointmentRouter: appointmentRouter;
  private reviewRouter: reviewRouter;
  private complainRouter: ComplainRouter;
  private bookingRouter: BookingRouter;
  private blogRouter: BlogRouter;

  constructor() {
    this.app = express(); // init the application
    this.configuration();
    this.userRouter = new userRouter();
    this.adminRouter = new adminRouter();
    this.docRouter = new docRouter();
    this.reviewRouter = new reviewRouter();
    this.appointmentRouter = new appointmentRouter();
    this.complainRouter = new ComplainRouter();
    this.bookingRouter = new BookingRouter();
    this.blogRouter = new BlogRouter();

    this.app.use("/api/v1/users", this.userRouter.router);
    this.app.use("/api/v1/admin", this.adminRouter.router);
    this.app.use("/api/v1/doctors", this.docRouter.router);
    this.app.use("/api/v1/appointments", this.appointmentRouter.router);
    this.app.use("/api/v1/reviews", this.reviewRouter.router);
    this.app.use("/api/v1/complains", this.complainRouter.router);
    this.app.use("/api/v1/bookings", this.bookingRouter.router);
    this.app.use("/api/v1/blogs", this.blogRouter.router);
  }

  /**
   * Method to configure the server,
   * If we didn't configure the port into the environment
   * variables it takes the default port 3000
   */
  public configuration() {
    this.app.set("port", env.PORT || 3001);
    this.app.use(cors());
    this.app.options("*", cors());
    this.app.use("/api", limiter);
    this.app.use(express.json());
    this.app.use(passport.initialize());
  }

  /**
   * Used to connect db server
   */
  public connectDb() {
    AppDataSource.initialize()
      .then(() => {
        console.log("connected to db !");
      })
      .catch((error) => console.log(error));
  }

  public sendCronjob() {
    if (sent) {
      console.log("CronJob started");
    }
  }

  /**
   * Used to start the server
   */
  public start() {
    this.app.listen(this.app.get("port"), () => {
      console.log(`Server is listening ${this.app.get("port")} port.`);
    });
  }
}

const server = new Server(); // Create server instance
server.connectDb(); // Connect Database
server.start(); // Execute the server
server.sendCronjob();
