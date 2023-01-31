import { Response, Request } from "express";
import { DataBaseErrorHandler } from "./../utils/databaseErrorHandler";
import { BlogService } from "./../services/blogService";
import { CustomRequest } from "./authController";
export class BlogController {
  private dbErrHandler: DataBaseErrorHandler;
  private BlogService: BlogService;
  constructor() {
    this.BlogService = new BlogService();
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

  public getAllBlogs = async (req: Request, res: Response) => {
    try {
      const Blogs = await this.BlogService.getBlogs(
        req.query.page,
        req.query.limit
      );
      res.status(200).json({
        status: "success",
        data: Blogs,
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };

  public getmyBlogs = async (req: CustomRequest, res: Response) => {
    try {
      const Blogs = await this.BlogService.getcuruserBlogs(
        req.query.page,
        req.query.limit,
        req?.user
      );
      res.status(200).json({
        status: "success",
        data: Blogs,
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };

  public getBlogbyId = async (req: Request, res: Response) => {
    try {
      const Blog = await this.BlogService.getBlog(
        req.query.page,
        req.query.limit,
        req.params.id
      );
      res.status(200).json({
        status: "success",
        data: Blog,
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };

  public addnewBlog = async (req: CustomRequest, res: Response) => {
    try {
      await this.BlogService.addBlog(
        req?.user,
        req.body?.title,
        req.body?.content,
        req.body?.tags,
        req.body?.author
      );
      res.status(200).json({
        status: "success",
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };


  public updateBlogbyId = async (req: CustomRequest, res: Response) => {
    try {
      await this.BlogService.updateBlog(
        req.body?.property,
        req.body?.value,
        req.body?.id
      );
      res.status(200).json({
        status: "success",
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };

  public deleteBlog = async (req: CustomRequest, res: Response) => {
    try {
      await this.BlogService.deleteBlog(req.params?.id);
      res.status(200).json({
        status: "success",
      });
    } catch (error) {
      this.errorResponse(error, res);
    }
  };
}
