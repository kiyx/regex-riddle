import RE2 from "re2";
import { prisma } from "../lib/prisma.js";

export interface CreateChallengeInput
{
  title: string;
  description?: string;
  secretRegex: string;
  positiveExample: string;
  negativeExample: string;
  positiveControls: string[];
  negativeControls: string[];
}

export interface ChallengeResponse
{
  id: string;
  title: string;
  description: string | null;
  positiveExample: string;
  negativeExample: string;
  author: { username: string; avatar: string | null };
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResult<T>
{
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const PUBLIC_SELECT =
{
  id: true,
  title: true,
  description: true,
  positiveExample: true,
  negativeExample: true,
  author: { select: { username: true, avatar: true } },
  createdAt: true,
  updatedAt: true,
} as const;

export async function getChallenges(
  options: {
    authorId?: string;
    unsolvedFor?: string;
    page?: number;
    limit?: number;
  } = {},
): Promise<PaginatedResult<ChallengeResponse>>
{
  const { authorId, unsolvedFor, page = 1, limit = 12 } = options;

  const where: Record<string, any> = {};
  if (authorId)
  {
    where.authorId = authorId;
  }
  if (unsolvedFor)
  {
    const solved = await prisma.solvedChallenge.findMany
    ({
      where: { userId: unsolvedFor },
      select: { challengeId: true },
    });
    where.id = { notIn: solved.map((s) => s.challengeId) };
    where.authorId = { not: unsolvedFor };
  }

  const [total, data] = await Promise.all
  ([
    prisma.challenge.count({ where }),
    prisma.challenge.findMany
    ({
      where,
      select: PUBLIC_SELECT,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getChallengeById(id: string): Promise<ChallengeResponse | null>
{
  return prisma.challenge.findUnique
  ({
    where: { id },
    select: PUBLIC_SELECT,
  });
}

export async function createChallenge
(
  data: CreateChallengeInput,
  authorId: string,
): Promise<ChallengeResponse>
{
  let secretRegex: RE2;
  try
  {
    secretRegex = new RE2(data.secretRegex);
  }
  catch
  {
    throw new Error("INVALID_SECRET_REGEX");
  }

  if(!secretRegex.test(data.positiveExample))
    throw new Error(`L'esempio positivo "${data.positiveExample}" NON matcha la regex segreta: deve essere accettato`);

  if(secretRegex.test(data.negativeExample))
    throw new Error(`L'esempio negativo "${data.negativeExample}" matcha la regex segreta: deve essere rifiutato`);

  for(const s of data.positiveControls)
    if(!secretRegex.test(s))
      throw new Error(`La stringa di controllo positiva "${s}" non matcha la regex segreta`);

  for(const s of data.negativeControls)
    if(secretRegex.test(s))
      throw new Error(`La stringa di controllo negativa "${s}" matcha la regex segreta`);

  return prisma.challenge.create
  ({
    data:
    {
      ...data,
      description: data.description ?? null,
      authorId,
    },
    select: PUBLIC_SELECT,
  });
}

export async function deleteChallenge
(
  challengeId: string,
  userId: string
): Promise<void>
{
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: { authorId: true },
  });

  if(!challenge)
    throw new Error("NOT_FOUND");

  if(challenge.authorId !== userId)
    throw new Error("FORBIDDEN");

  await prisma.challenge.delete
  ({
    where: { id: challengeId },
  });
}

export interface AttemptResult
{
    positiveMatches: number;
    negativeMatches: number;
    totalPositive: number;
    totalNegative: number;
    isCorrect: boolean;
}

export async function createAttempt
(
    challengeId: string,
    userId: string,
    proposedRegex: string,
): Promise<AttemptResult>
{
    const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId },
        select:
        {
            id: true,
            authorId: true,
            secretRegex: true,
            positiveControls: true,
            negativeControls: true,
        },
    });

    if (!challenge)
        throw new Error("NOT_FOUND");

    if (challenge.authorId === userId)
        throw new Error("CANNOT_SOLVE_OWN");

    const alreadySolved = await prisma.solvedChallenge.findUnique({
        where: { challengeId_userId: { challengeId, userId } },
    });
    if (alreadySolved)
        throw new Error("ALREADY_SOLVED");

    let regex: RE2;
    try
    {
        regex = new RE2(proposedRegex);
    }
    catch
    {
        throw new Error("INVALID_REGEX");
    }

    let positiveMatches = 0;
    for(const s of challenge.positiveControls)
        if(regex.test(s))
            positiveMatches++;

    let negativeMatches = 0;
    for(const s of challenge.negativeControls)
        if(regex.test(s))
            negativeMatches++;

    const totalPositive = challenge.positiveControls.length;
    const totalNegative = challenge.negativeControls.length;
    const isCorrect = positiveMatches === totalPositive && negativeMatches === 0;

    await prisma.attempt.create({
        data: {
            proposedRegex,
            positiveMatches,
            negativeMatches,
            totalPositive,
            totalNegative,
            isCorrect,
            userId,
            challengeId,
        },
    });

    if(isCorrect)
    {
        const alreadySolved = await prisma.solvedChallenge.findUnique
        ({
            where: { challengeId_userId: { challengeId, userId } },
        });

        if(!alreadySolved)
        {
            const attemptCount = await prisma.attempt.count
            ({
                where: { userId, challengeId, isCorrect: false },
            });

            await prisma.solvedChallenge.create
            ({
                data: {
                    userId,
                    challengeId,
                    attemptsUsed: attemptCount + 1,
                },
            });
        }
    }

    return { positiveMatches, negativeMatches, totalPositive, totalNegative, isCorrect };
}

export interface AttemptResponse
{
    id: string;
    proposedRegex: string;
    positiveMatches: number;
    negativeMatches: number;
    totalPositive: number;
    totalNegative: number;
    isCorrect: boolean;
    attemptedAt: Date;
}

export async function getAttempts(userId: string, challengeId: string): Promise<AttemptResponse[]>
{
    return prisma.attempt.findMany
    ({
        where: { userId, challengeId },
        select: {
            id: true,
            proposedRegex: true,
            positiveMatches: true,
            negativeMatches: true,
            totalPositive: true,
            totalNegative: true,
            isCorrect: true,
            attemptedAt: true,
        },
        orderBy: { attemptedAt: "desc" },
    });
}

export async function getSolvedChallengeIds(userId: string): Promise<string[]>
{
    const solved = await prisma.solvedChallenge.findMany
    ({
        where: { userId },
        select: { challengeId: true },
    });
    return solved.map((s) => s.challengeId);
}

export interface LeaderboardEntry
{
    username: string;
    avatar: string | null;
    solvedCount: number;
    avgAttempts: number;
}

export async function getLeaderboard(
  page = 1,
  limit = 20,
): Promise<PaginatedResult<LeaderboardEntry>>
{
    const grouped = await prisma.solvedChallenge.groupBy
    ({
        by: ["userId"],
        _count: { challengeId: true },
        _avg: { attemptsUsed: true },
        orderBy: [
            { _count: { challengeId: "desc" } },
            { _avg: { attemptsUsed: "asc" } },
        ],
        skip: (page - 1) * limit,
        take: limit,
    });

    const totalResult = await prisma.solvedChallenge.groupBy
    ({
        by: ["userId"],
        _count: { challengeId: true },
    });
    const total = totalResult.length;

    const userIds = grouped.map((g) => g.userId);
    const users = await prisma.user.findMany
    ({
        where: { id: { in: userIds } },
        select: { id: true, username: true, avatar: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const data = grouped.map((entry) => ({
        username: userMap.get(entry.userId)?.username ?? "sconosciuto",
        avatar: userMap.get(entry.userId)?.avatar ?? null,
        solvedCount: entry._count.challengeId,
        avgAttempts: Math.round((entry._avg.attemptsUsed ?? 0) * 100) / 100,
    }));

    return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}
