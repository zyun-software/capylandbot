import { getUser } from '$lib/server';
import { redirect } from '@sveltejs/kit';

export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();

		const initData = (data.get('init-data') ?? '').toString();
		cookies.set('init-data', initData);

		let error = false;
		try {
			await getUser(cookies);
		} catch (redirect: any) {
			error = true;
		}

		if (!error) {
			throw redirect(307, '/');
		}

		return {
			success: !error
		};
	}
};
