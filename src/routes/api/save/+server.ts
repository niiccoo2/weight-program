import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { saveWeight } from '#lib/server/db.ts';

export const POST: RequestHandler = async ({ request }) => {
	const { name, weight, time, scale_id, auth_id } = await request.json();

	saveWeight.run({
		name,
		weight,
		time,
		scale_id,
		auth_id
	});

	return Response.json('Success');
};
