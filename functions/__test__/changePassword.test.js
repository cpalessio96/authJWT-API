import bcrypt from "bcryptjs";
import { changePassword } from "../userOperations/changePassword.js";
import User from "../../model/user.js";

process.env.TOKEN_KEY = "12345";

const password = "12345678";
const encryptedPassword = await bcrypt.hash(password, 10);

describe("change password function", () => {
  beforeEach(() => {
    User.findOne = async () => ({
      email: "alessio@example.com",
      role: "member",
      firstName: "alessio",
      lastName: "catania",
      password: encryptedPassword,
    });
    User.updateOne = async () => true;
  });

  it("change password success", async () => {
    const response = await changePassword({
      email: "alessio@example.com",
      newPassword: "123456789",
      oldPassword: password,
    });

    expect(response).toMatchObject({
      code: 200,
      json: {
        success: true,
      },
    });
  });

  it("change password error: password errata", async () => {
    const response = await changePassword({
      email: "alessio@example.com",
      newPassword: "123456789",
      oldPassword: "123", // password sbagliata
    });

    expect(response).toMatchObject({
      code: 400,
      json: {
        message: "invalid credentials",
      },
    });
  });

  it("change password error: input mancanti", async () => {
    const response = await changePassword({
      email: "alessio@example.com",
      newPassword: "123456789",
    });

    expect(response).toMatchObject({
      code: 400,
      json: {
        message: "all input is required",
      },
    });
  });
});
