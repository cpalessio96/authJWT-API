import bcrypt from "bcryptjs";
import { loginUser } from "../login/loginHelper.js";
import User from "../../model/user.js";
import BlackListUser from "../../model/blackListUser.js";

process.env.TOKEN_KEY = "12345";

const password = "12345678";
const encryptedPassword = await bcrypt.hash(password, 10);

describe("login function", () => {
  beforeEach(() => {
    User.findOne = async () => ({
      email: "alessio@example.com",
      role: "member",
      firstName: "alessio",
      lastName: "catania",
      password: encryptedPassword,
    });
    BlackListUser.deleteOne = async () => true;
  });

  it("Login success", async () => {
    const response = await loginUser({
      email: "alessio@example.com",
      password,
    });

    expect(response).toMatchObject({
      code: 200,
      json: {
        user: {
          firstName: "alessio",
          lastName: "catania",
          email: "alessio@example.com",
        },
      },
    });
    expect(response.json.user).toHaveProperty("token");
  });

  it("Richiesta con input mancanti", async () => {
    const response = await loginUser({
      password,
    });

    expect(response).toMatchObject({
      code: 400,
      json: {
        message: "all input is required",
      },
    });
  });

  it("Login con password sbagliata", async () => {
    const response = await loginUser({
      password: "password1",
      email: "alessio@example.com",
    });

    expect(response).toMatchObject({
      code: 400,
      json: { message: "invalid credentials" },
    });
  });
});
