import bcrypt from "bcryptjs";
import { registerUser } from "../register/registerHelper.js";
import User from "../../model/user.js";
import BlackListUser from "../../model/blackListUser.js";

process.env.TOKEN_KEY = "12345";

const password = "12345678";
const encryptedPassword = await bcrypt.hash(password, 10);

describe("register function", () => {
  beforeEach(() => {
    User.findOne = async () => null;
    User.create = async () => ({
      email: "alessio@example.com",
      password: encryptedPassword,
      firstName: "alessio",
      lastName: "catania",
      role: "member",
    });
  });

  it("Register success", async () => {
    const response = await registerUser({
      email: "alessio@example.com",
      password,
      firstName: "alessio",
      lastName: "catania",
    });
    expect(response).toMatchObject({
      code: 201,
      json: {
        firstName: "alessio",
        lastName: "catania",
        email: "alessio@example.com",
      },
    });
    expect(response.json).toHaveProperty("token");
  });

  it("Register input non valido", async () => {
    const response = await registerUser({
      email: "email.non.valida@",
      password,
      firstName: "alessio",
      lastName: "catania",
    });
    expect(response).toMatchObject({
      code: 400,
      json: {
        message: "Bad request: invalid input",
      },
    });
  });
});

describe("register function: l'utente già esiste", () => {
  beforeEach(() => {
    User.findOne = async () => ({
      email: "alessio@example.com",
      password: encryptedPassword,
      firstName: "alessio",
      lastName: "catania",
      role: "member",
    });
  });

  it("Register, l'utente già esiste", async () => {
    const response = await registerUser({
      email: "alessio@example.com",
      password,
      firstName: "alessio",
      lastName: "catania",
    });
    expect(response).toMatchObject({
      code: 409,
      json: {
        message: "User already exists",
      },
    });
  });
});
