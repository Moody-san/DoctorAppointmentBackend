import { Router } from "express";
import { BlogController } from "./../controllers/blogController";
import { AuthController } from "./../controllers/authController";
import { Role } from "./../models/User";
export class BlogRouter {
  public router: Router;
  private BlogController: BlogController;
  private authController: AuthController;

  constructor() {
    this.router = Router();
    this.BlogController = new BlogController();
    this.authController = new AuthController();
    this.routes();
  }

  private routes() {
    this.router.get("/getallblogs", this.BlogController.getAllBlogs);
    this.router.post(
      "/addnewblog",
      this.authController.authorization,
      this.authController.authentication(Role.Doctor),
      this.BlogController.addnewBlog
    );
    this.router.get(
      "/getmyblogs",
      this.authController.authorization,
      this.authController.authentication(Role.Doctor),
      this.BlogController.getmyBlogs
    );
    this.router.get(
      "/getblog/:id",
      this.authController.authorization,
      this.authController.authentication(Role.Doctor),
      this.BlogController.getBlogbyId
    );
    this.router.post(
      "/updateblog",
      this.authController.authorization,
      this.authController.authentication(Role.Doctor),
      this.BlogController.updateBlogbyId
    );
    this.router.delete(
      "/deleteblog/:id",
      this.authController.authorization,
      this.authController.authentication(Role.Doctor),
      this.BlogController.deleteBlog
    );
  }
}
