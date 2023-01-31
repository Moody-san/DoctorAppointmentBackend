import { AppDataSource } from "./../dbconfig";
import { Complain } from "./../models/Complain";

export const ComplainRepository = AppDataSource.getRepository(Complain).extend(
  {}
);
