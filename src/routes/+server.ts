import {
	DISCORD_BOT_CLIENT_ID,
	DISCORD_REDIRECT_URL,
	TG_SECRET_TOKEN,
	URL_PANEL
} from '$env/static/private';
import {
	findUserById,
	findUserByNickname,
	getUserById,
	setUserNickname,
	telegram
} from '$lib/server';
import { text } from '@sveltejs/kit';

export async function POST({ request }) {
	const token = request.headers.get('x-telegram-bot-api-secret-token') ?? '';

	if (TG_SECRET_TOKEN !== token) {
		return text('Невірний токен доступу');
	}

	const data = await request.json();

	const chat_id = data?.message?.from?.id ?? null;

	if ([494209756, 798420568].includes(chat_id)) {
		const nicknameMatches = data.message.text.match(/^Псевдонім (\d+) (.+)$/);

		if (nicknameMatches) {
			const u = await findUserById(nicknameMatches[1]);
			const n = await findUserByNickname(nicknameMatches[2]);

			if (u && !n) {
				await setUserNickname(nicknameMatches[1], nicknameMatches[2]);

				await telegram('sendMessage', {
					chat_id,
					text: '✅ Псевдонім змінено'
				});
				return text('зміна псевдоніму');
			}
		}
	}

	if (chat_id === null) {
		return text('Невдалося визначити user id');
	}

	const buttons = [
		[
			{
				web_app: { url: URL_PANEL },
				text: '🎛 Перейти до панелі'
			}
		]
	];

	const user = await getUserById(chat_id);
	if (!user.nickname) {
		const discordUrl =
			'https://discord.com/oauth2/authorize' +
			'?response_type=token' +
			`&client_id=${DISCORD_BOT_CLIENT_ID}` +
			'&scope=identify' +
			`&state=${user.id}&` +
			`redirect_uri=${DISCORD_REDIRECT_URL}`;

		buttons.push([
			{
				web_app: { url: discordUrl },
				text: '↘️ Підтягнути псевдонім з Discord'
			}
		]);
	}

	await telegram('sendMessage', {
		chat_id,
		text:
			'🌿 Ласкаво просимо до офіційного бота Долини Капібар! Натискайте кнопку нижче, щоб легко перейти до основного функціоналу та насолоджуватися унікальними можливостями, які пропонує наш бот. 🤖\n\n' +
			`🆔 Ваш код: <code>${chat_id}</code>\n\n` +
			'😊 Дякуємо що обираєте нас!\n\n' +
			'🌟 Якщо у вас виникнуть питання чи потрібна допомога, не соромтеся звертатися. Бажаємо приємного користування! 🌟',
		parse_mode: 'HTML',
		reply_markup: {
			inline_keyboard: buttons
		}
	});

	return text('готово');
}
