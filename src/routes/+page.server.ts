import { createSession, deleteSession, getSessionsByUserId, getUser } from '$lib/server';

export async function load({ request, cookies }) {
	const user = await getUser(cookies);
	const session = await getSessionsByUserId(user.id);

	return {
		nickname: user.nickname,
		ip: request.headers.get('x-real-ip'),
		session: session ? session.map((s) => s.ip_address) : []
	};
}

export const actions = {
	add: async ({ request, cookies }) => {
		const user = await getUser(cookies);
		const data = await request.formData();
		const ip = (data.get('ip') ?? '').toString();

		if (/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
			await createSession(user.id, ip);
			return {
				message: '✅ Сесію додано'
			};
		}

		return {
			message: '🚫 IP адреса не вірна'
		};
	},
	delete: async ({ request, cookies }) => {
		const user = await getUser(cookies);
		const data = await request.formData();
		const ip = (data.get('ip') ?? '').toString();

		await deleteSession(user.id, ip);

		return {
			message: '✅ Сесію видалено'
		};
	}
};
