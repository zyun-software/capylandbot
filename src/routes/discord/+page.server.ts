import { findPlayerByUserId, findUserByNickname, setUserNickname } from '$lib/server/api.js';
import axios from 'axios';
import { readFileSync } from 'fs';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();

		const hash = (data.get('hash') ?? '').toString();

		const hashWithoutHash = hash.slice(1);

		const urlSearchParams = new URLSearchParams(hashWithoutHash);

		const accessToken = urlSearchParams.get('access_token');
		const state = urlSearchParams.get('state');

		const url = 'https://discord.com/api/v9/users/@me';
		try {
			const response = await axios.get<any>(url, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
					Accept: 'application/json'
				}
			});

			const jsonData = readFileSync('whitelist.json', 'utf8');
			const json = JSON.parse(jsonData);

			const player = await findPlayerByUserId(response.data.id);
			if (!player) {
				return {
					success: false,
					message: '⛔️ Ви не були авторизовані через Discord'
				};
			}

			const whitelistFind = json.find((j: any) => j.uuid === player.uuid);
			if (!whitelistFind) {
				return {
					success: false,
					message: '⛔️ Вас немає в білому списку'
				};
			}

			const p = await findUserByNickname(whitelistFind.name);
			if (p) {
				return {
					success: false,
					message: '⛔️ Гравець з таким псевдонімом вже існує'
				};
			}

			await setUserNickname(state ?? '', whitelistFind.name);

			return {
				success: true,
				message: "✅ Псевдонім прив'язано"
			};
		} catch {
			return {
				success: false,
				message: '⛔️ Помилка авторизації Discord'
			};
		}
	}
};
