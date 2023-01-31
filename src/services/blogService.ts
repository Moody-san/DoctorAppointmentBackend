import { AppError } from "./../utils/AppError";
import { BlogRepository } from "./../repositories/blogRepo";
import { DoctorRepository } from "./../repositories/doctorRepo";
export class BlogService {
  constructor() {}

  public async getBlogs(page: any, limit: any) {
    try {
      let p: number = +page || 1;
      let l: number = +limit || 1000;
      let s: number = (p - 1) * l;
      let Blogs = await BlogRepository.createQueryBuilder("Blog")
        .skip(s)
        .take(l)
        .getRawMany();
      return Blogs;
    } catch (error) {
      throw error;
    }
  }

  public async updateBlog(property: any, value: any,id: number) {
    try {
      let Blog = await BlogRepository.createQueryBuilder("Blog")
      .where("Blog.id =:id", { id:id })
      .getOne();
      if (Blog === null || undefined) {
        throw new AppError("Blog not found", 400);
      }
      if(property==="title"){
        Blog.title=value;
      }
      else if(property==="content"){
        Blog.content=value
      }
      else if(property==="tags"){
        Blog.tags=value
      }
      else if(property==="author"){
        Blog.author=value
      }
        BlogRepository.save(Blog);
    } catch (error) {
      throw error;
    }
  }

  public async getBlog(page: any, limit: any,id:string) {
    try {
      let Id=parseInt(id);
      let p: number = +page || 1;
      let l: number = +limit || 1000;
      let s: number = (p - 1) * l;
      let Blogs = await BlogRepository.createQueryBuilder("Blog")
      .where("Blog.id =:id", { id:Id })
      .skip(s)
      .take(l)
      .getOne();
      return Blogs;
    } catch (error) {
      throw error;
    }
  }

  public async getcuruserBlogs(page: any, limit: any, user: any) {
    try {
      let p: number = +page || 1;
      let l: number = +limit || 1000;
      let s: number = (p - 1) * l;
      let Blogs = await BlogRepository.createQueryBuilder("Blog")
        .where("Blog.doctorUserId =:id", { id: user.id })
        .skip(s)
        .take(l)
        .getRawMany();
      return Blogs;
    } catch (error) {
      throw error;
    }
  }

  public deleteBlog = async (id: string) => {
    try {
      let Id = parseInt(id);
      await BlogRepository.delete({ id: Id });
    } catch (error) {
      throw error;
    }
  };

  public async addBlog(
    user: any,
    title: string,
    content: string,
    tags: any,
    author: any
  ) {
    try {
      let doctor = await DoctorRepository.findOne({
        where: { userId: user.id },
      });
      if (doctor === null) {
        throw new AppError("Doctor not found login again", 400);
      }
      if (title === undefined || content === undefined || tags === undefined) {
        throw new AppError("did not recieve expected parameters", 400);
      }
      if (title.length === 0 || content.length === 0 || tags[0].length === 0) {
        throw new AppError("cannot add empty fields", 400);
      }
      await BlogRepository.createQueryBuilder()
        .insert()
        .values([
          {
            addedon: new Date(),
            author: author || doctor.name,
            content: content,
            doctor: doctor,
            tags: tags,
            title: title,
          },
        ])
        .execute();
    } catch (error) {
      throw error;
    }
  }
}
