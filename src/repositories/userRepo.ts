import { AppDataSource } from "./../dbconfig";
import { User } from "./../models/User";

export const UserRepository = AppDataSource.getRepository(User).extend({});
