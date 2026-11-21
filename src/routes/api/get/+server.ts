import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getWeights } from '#lib/server/db.ts';

export const GET: RequestHandler = () => {
	const response = getWeights.all();

	return Response.json(response);
};
