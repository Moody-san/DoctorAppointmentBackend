import { AppDataSource } from "./../dbconfig";
import { Blog } from "./../models/Blog";

export const BlogRepository = AppDataSource.getRepository(Blog).extend({});
