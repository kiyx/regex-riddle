import { request } from '@playwright/test';

const API = 'http://localhost:8080';

async function waitForBackend(maxRetries = 30): Promise<void>
{
	const ctx = await request.newContext({ baseURL: API });
	for (let i = 0; i < maxRetries; i++)
	{
		try
		{
			const res = await ctx.get('/health', { timeout: 2000 });
			if (res.ok())
			{
				await ctx.dispose();
				return;
			}
		}
		catch
		{
			// backend non ancora pronto
		}
		await new Promise(r => setTimeout(r, 1000));
	}
	await ctx.dispose();
	throw new Error('Backend non disponibile dopo 30 tentativi');
}

export default async function globalSetup(): Promise<void>
{
	await waitForBackend();
	const ctx = await request.newContext({ baseURL: API });
	await ctx.delete('/e2e/cleanup').catch(() => {});
	await ctx.dispose();
}
