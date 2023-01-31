import { AppDataSource } from "./../dbconfig";
import { Review } from "./../models/Review";

export const ReviewRepository = AppDataSource.getRepository(Review).extend({});
