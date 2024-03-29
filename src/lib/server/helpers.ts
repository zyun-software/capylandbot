import { TG_TOKEN } from '$env/static/private';
import { redirect, type Cookies } from '@sveltejs/kit';
import { createHmac } from 'crypto';
import { getUserById } from '.';

export const getUser = async (cookies: Cookies) => {
	const initData = cookies.get('init-data') ?? '';

	const encoded = decodeURIComponent(initData);

	const secret = createHmac('sha256', 'WebAppData').update(`${TG_TOKEN}`);

	const arr = encoded.split('&');
	const hashIndex = arr.findIndex((str) => str.startsWith('hash='));
	const hash = arr.splice(hashIndex)[0].split('=')[1];
	arr.sort((a, b) => a.localeCompare(b));
	const dataCheckString = arr.join('\n');

	const _hash = createHmac('sha256', secret.digest()).update(dataCheckString).digest('hex');

	const valid = _hash === hash;
	const userField = arr.find((str) => str.startsWith('user='));

	const throwUnauthorized = () => redirect(307, `/login`);

	if (!valid || !userField) {
		throw throwUnauthorized();
	}

	const match = userField.match(/"id":(\d+),/);
	if (!match) {
		throw throwUnauthorized();
	}

	// const id = JSON.parse(decodeURIComponent(userField.split('=')[1])).id;

	const user = await getUserById(match[1]);

	return user;
};
