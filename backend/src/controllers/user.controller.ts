import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

export interface ChangePasswordInput
{
  oldPassword: string;
  newPassword: string;
}

export async function changePassword(userId: string, data: ChangePasswordInput): Promise<void>
{
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if(!user)
    throw new Error("Utente non trovato");

  const ok = await bcrypt.compare(data.oldPassword, user.password);
  if(!ok)
    throw new Error("Password attuale errata");

  const hash = await bcrypt.hash(data.newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hash } });
}

export async function updateAvatar
(
  userId: string,
  avatarPath: string,
): Promise<{ avatar: string }>
{
  const user = await prisma.user.update
  ({
    where: { id: userId },
    data: { avatar: avatarPath },
    select: { avatar: true },
  });

  return { avatar: user.avatar ?? avatarPath };
}

export interface UserProfile
{
  username: string;
  email: string;
  avatar: string | null;
  createdAt: Date;
}

export async function getProfile(userId: string): Promise<UserProfile>
{
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
      email: true,
      avatar: true,
      createdAt: true,
    },
  });

  if(!user)
    throw new Error("NOT_FOUND");

  return user;
}

export interface UpdateProfileInput
{
  username?: string;
  email?: string;
}

export async function updateProfile
(
  userId: string,
  data: UpdateProfileInput,
): Promise<UserProfile>
{
    if(data.username || data.email)
    {
      const clauses: Array<{ username?: string; email?: string }> = [];
      if(data.username)
        clauses.push({ username: data.username });
      if(data.email)
        clauses.push({ email: data.email });

      const existing = await prisma.user.findFirst({
        where: { OR: clauses, NOT: { id: userId } },
      });

      if(existing)
      {
        if(data.username && existing.username === data.username)
          throw new Error("Username già in uso");
        if(data.email && existing.email === data.email)
          throw new Error("Email già in uso");
        throw new Error("Username o email già in uso");
      }
    }

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.username && { username: data.username }),
      ...(data.email && { email: data.email }),
    },
    select: {
      username: true,
      email: true,
      avatar: true,
      createdAt: true,
    },
  });
}
