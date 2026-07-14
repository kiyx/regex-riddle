import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export interface LoginInput
{
  username: string;
  password: string;
}

export interface RegisterInput
{
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse
{
  token: string;
  user: { username: string; email: string };
}

export interface UserResponse
{
  username: string;
  email: string;
}

export async function login(data: LoginInput): Promise<AuthResponse>
{
	const user = await prisma.user.findFirst({
		where: { username: { equals: data.username, mode: 'insensitive' } },
	});

	if(!user)
		throw new Error("Credenziali errate");

	const ok: boolean = await bcrypt.compare(data.password, user.password);
	if(!ok)
		throw new Error("Credenziali errate");

	const secret: string | undefined = process.env.JWT_SECRET;
	const expiresIn: string | undefined = process.env.JWT_EXPIRES_IN;
	if(!secret || !expiresIn)
		throw new Error("Configurazione JWT mancante");

	const token: string = jwt.sign({ userId: user.id }, secret, { expiresIn } as jwt.SignOptions);

	return { token, user: { username: user.username, email: user.email } };
}

export async function register(data: RegisterInput): Promise<UserResponse>
{
	const exists = await prisma.user.findFirst
	({
		where:
		{
			OR: [
				{ username: data.username },
				{ email: data.email },
			],
		},
	});

	if(exists)
		throw new Error("Username o email già in uso");

	const hash: string = await bcrypt.hash(data.password, 10);

	const user = await prisma.user.create
	({
		data:
		{
			username: data.username,
			email: data.email,
			password: hash,
		},
	});

	return { username: user.username, email: user.email };
}
