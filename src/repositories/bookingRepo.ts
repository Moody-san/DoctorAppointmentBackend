import { AppDataSource } from "./../dbconfig";
import { Booking } from "./../models/Booking";

export const BookingRepository = AppDataSource.getRepository(Booking).extend(
  {}
);
