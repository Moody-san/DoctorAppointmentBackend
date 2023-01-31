import { AppError } from "./AppError";

export class DataBaseErrorHandler {
  constructor() {}
  public errorParser = (error: any) => {
    if (error.code == 23505) {
      if (error.driverError.table === "appointment")
        return new AppError(`You already have an appointment at that day`, 409);
      else if (error.driverError.table === "review")
        return new AppError(`You have already reviewed the doctor`, 409);
      else if (error.driverError.table === "complain")
        return new AppError(
          `You have already complained about the doctor`,
          409
        );
      else {
        console.log(error);
        return new AppError(`Account already exists with that email`, 409);
      }
    } else {
      console.log(error);
      return new AppError(`${error}`, 500);
    }
  };
}
