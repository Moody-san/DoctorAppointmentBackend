import { Router } from "express";
import { docController } from "./../controllers/docController";
export class docRouter {
  public router: Router;
  private docController: docController;

  constructor() {
    this.router = Router();
    this.docController = new docController();
    this.routes();
  }

  private routes() {
    this.router.get("/getalldoc", this.docController.getAllDoctors);
    this.router.get("/docmoney/:id", this.docController.getdocincome);
    this.router.get("/search", this.docController.getDocByName);
    this.router.get("/findnearestdoc", this.docController.findDoctorsNearby);
    this.router.route("/:id").get(this.docController.getDocById);
  }
}
