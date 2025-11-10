import { BaseModel } from "./base.repo";

export class UserModel extends BaseModel {
  constructor() {
    super("user");
  }

  async findByEmail(email) {
    return this.model.findUnique({
      where: { email },
    });
  }

  async findTeachers() {
    return this.model.findMany({
      where: { role: "TEACHER" },
    });
  }

  async findById(id) {
    return this.model.findUnique({
      where: { id },
    });
  }
}
