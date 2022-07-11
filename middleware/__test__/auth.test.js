import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";
import verifyToken from "../auth";
import BlackListUser from "../../model/blackListUser";
import DateToken from "../../model/dateToken.js";
import User from "../../model/user";

// chiave privata di esempio per decodificare il jwt
process.env.TOKEN_KEY = "e6344e26-c26f-4a17-87a3-5cff02471054";

// data settata da admin per invalidare tutti i token creati precedentemente
const dataTokenExpired = "1657565477088";

// token valido
const validToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOiIxNjU3NTY1NDc3MDg5IiwiZW1haWwiOiJhbGVzc2lvQGV4YW1wbGUuY29tIn0.wwR0YBMN4L70yhJYj_TSqGkkBxG_np9XneeNPKhJgoY";

// token valido ma con una data di created at maggiore di quella settata da admin
const expiredToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOiIxNjU3NTY1NDc3MDg3IiwiZW1haWwiOiJhbGVzc2lvQGV4YW1wbGUuY29tIn0.UGqZ-rdzGVlUr6ZHd3i99ua7gO3Pd0PRp4FEXRPqDq0";

// token non valido
const invalidToken =
  "eyJhbtttOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOiIxNjU3NTY2NzUzMDA3IiwiZW1haWwiOiJhbGVzc2lvQGV4YW1wbGUuY29tIn0.7qThCKD9O_-ziqJCER6rRJwSNnSPpWt1ttCIJeeBY9c";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue({ send: (e) => e });
  return res;
};

describe("Ruolo Member: authenticator con black list vuota", () => {
  beforeEach(() => {
    BlackListUser.findOne = async () => null;
    User.findOne = async () => ({
      email: "alessio@example.com",
      role: "member",
      firstName: "alessio",
      lastName: "catania",
    });
    DateToken.findOne = async () => [
      {
        createdAt: dataTokenExpired,
      },
    ];
  });

  it("getData: token valido, utente con permessi corretti", async () => {
    const mockedRes = mockRes();
    const mockedNext = jest.fn();
    const req = {
      email: "alessio@example.com",
      url: "/getData",
      headers: {
        ["x-access-token"]: validToken,
      },
    };
    await verifyToken(req, mockedRes, mockedNext);
    expect(req.user).toMatchObject({
      email: "alessio@example.com",
      role: "member",
      firstName: "alessio",
      lastName: "catania",
    });
    expect(mockedNext.mock.calls.length).toBe(1);
  });

  it("change password: utente con token valido ma senza permesso per fare l'azione", async () => {
    const mockedRes = mockRes();
    const mockedNext = jest.fn();
    const req = {
      email: "alessio@example.com",
      url: "/changePassword",
      headers: {
        ["x-access-token"]: validToken,
      },
    };
    await verifyToken(req, mockedRes, mockedNext);

    expect(mockedRes.status.mock.calls[0][0]).toBe(403);
  });

  it("token non presente", async () => {
    const mockedRes = mockRes();
    const mockedNext = jest.fn();
    const req = {
      email: "alessio@example.com",
      url: "/changePassword",
      headers: {},
    };
    await verifyToken(req, mockedRes, mockedNext);

    expect(mockedRes.status.mock.calls[0][0]).toBe(403);
  });

  it("token non valido", async () => {
    const mockedRes = mockRes();
    const mockedNext = jest.fn();
    const req = {
      email: "alessio@example.com",
      url: "/changePassword",
      headers: {
        ["x-access-token"]: invalidToken,
      },
    };
    await verifyToken(req, mockedRes, mockedNext);

    expect(mockedRes.status.mock.calls[0][0]).toBe(401);
  });

  it("token scaduto: data di creazione precedente alla data settata da admin", async () => {
    const mockedRes = mockRes();
    const mockedNext = jest.fn();
    const req = {
      email: "alessio@example.com",
      url: "/changePassword",
      headers: {
        ["x-access-token"]: expiredToken,
      },
    };
    await verifyToken(req, mockedRes, mockedNext);

    expect(mockedRes.status.mock.calls[0][0]).toBe(403);
  });
});

describe("authenticator con utente in black list", () => {
  beforeEach(() => {
    BlackListUser.findOne = async () => ({
      email: "alessio-blackListed@example.com",
    });
    User.findOne = async () => ({
      email: "alessio@example.com",
      role: "member",
      firstName: "alessio",
      lastName: "catania",
    });
    DateToken.findOne = async () => [
      {
        createdAt: dataTokenExpired,
      },
    ];
  });
  it("utente in black list", async () => {
    const mockedRes = mockRes();
    const mockedNext = jest.fn();
    const req = {
      email: "alessio-backListed@example.com",
      url: "/getData",
      headers: {
        ["x-access-token"]: validToken,
      },
    };
    await verifyToken(req, mockedRes, mockedNext);

    expect(mockedNext.mock.calls.length).toBe(0);
    expect(mockedRes.status.mock.calls[0][0]).toBe(401);
  });
});

describe("Ruolo Manager: authenticator con black list vuota", () => {
  beforeEach(() => {
    BlackListUser.findOne = async () => null;
    User.findOne = async () => ({
      email: "alessio@example.com",
      role: "manager",
      firstName: "alessio",
      lastName: "catania",
    });
    DateToken.findOne = async () => [
      {
        createdAt: dataTokenExpired,
      },
    ];
  });

  it("changePassword: token valido, utente con permessi corretti", async () => {
    const mockedRes = mockRes();
    const mockedNext = jest.fn();
    const req = {
      email: "alessio@example.com",
      url: "/changePassword",
      headers: {
        ["x-access-token"]: validToken,
      },
    };
    await verifyToken(req, mockedRes, mockedNext);
    expect(mockedNext.mock.calls.length).toBe(1);
  });
});
