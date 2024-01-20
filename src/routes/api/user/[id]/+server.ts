import { findUserById } from '$lib/server/api.js';
import { json } from '@sveltejs/kit';

export async function GET({ params }) {
  const user = await findUserById(params.id)

  return json({
    user
  });
}