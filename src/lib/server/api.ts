import {
	MYSQL_DATABASE,
	MYSQL_HOST,
	MYSQL_PASSWORD,
	MYSQL_USER,
	TG_TOKEN
} from '$env/static/private';
import axios from 'axios';
import * as mysql from 'mysql2/promise';

export const telegram = async (method: string, data: any) => {
	try {
		const result = await axios.post(`https://api.telegram.org/bot${TG_TOKEN}/${method}`, data);

		return result;
	} catch (error: any) {
		console.log('## Помилка запиту до Telegram');

		if (error.response) {
			console.log('Статус відмови:', error.response.status);
			console.log('Дані відповіді:', error.response.data);
		} else if (error.request) {
			console.log('Помилка запиту:', error.request);
		} else {
			console.log('Помилка налаштування:', error.message);
		}

		error.config.data = JSON.parse(error.config.data);
		console.log('Додаткові деталі про помилку:', error.config);

		return null;
	}
};

const sql = async <TResult>(callback: (connection: mysql.Connection) => Promise<TResult>) => {
	const connection = await mysql.createConnection({
		host: MYSQL_HOST,
		user: MYSQL_USER,
		password: MYSQL_PASSWORD,
		database: MYSQL_DATABASE
	});

	try {
		const result = await callback(connection);
		return result;
	} catch (error) {
		console.log('Mysql error:', error);
		return null;
	} finally {
		await connection.end();
	}
};

export type UserType = {
	id: string;
	nickname: string | null;
	discord_id: string | null;
};

export const findUserById = async (id: string): Promise<UserType | null> => {
	return sql<UserType | null>(async (connection) => {
		const [rows] = await connection.execute<any>('SELECT * FROM capylandbot_users WHERE id = ?', [
			id
		]);

		if (rows.length > 0) {
			return rows[0];
		} else {
			return null;
		}
	});
};

export const getUserById = async (id: string): Promise<UserType> => {
	const existingUser = await findUserById(id);

	if (existingUser) {
		return existingUser;
	}

	await sql<void>(async (connection) => {
		await connection.execute('INSERT INTO capylandbot_users (id) VALUES (?)', [id]);
	});

	return {
		id,
		nickname: '',
		discord_id: ''
	};
};

export type SessionType = {
	user_id: string;
	ip_address: string;
};

export const getSessionsByUserId = async (user_id: string) => {
	return sql<SessionType[]>(async (connection) => {
		const [rows] = await connection.execute<any>(
			'SELECT * FROM capylandbot_sessions WHERE user_id = ?',
			[user_id]
		);

		return rows;
	});
};

export const findSession = async (user_id: string, ip_address: string) => {
	return sql<SessionType | null>(async (connection) => {
		const [rows] = await connection.execute<any>(
			'SELECT * FROM capylandbot_sessions WHERE user_id = ? AND ip_address = ?',
			[user_id, ip_address]
		);

		if (rows.length > 0) {
			return rows[0];
		} else {
			return null;
		}
	});
};

export const createSession = async (user_id: string, ip_address: string): Promise<void> => {
	const exists = await findSession(user_id, ip_address);

	if (exists) {
		return;
	}

	await sql<void>(async (connection) => {
		await connection.execute(
			'INSERT INTO capylandbot_sessions (user_id, ip_address) VALUES (?, ?)',
			[user_id, ip_address]
		);
	});
};

export const deleteSession = async (user_id: string, ip_address: string): Promise<void> => {
	await sql<void>(async (connection) => {
		await connection.execute(
			'DELETE FROM capylandbot_sessions WHERE user_id = ? AND ip_address = ?',
			[user_id, ip_address]
		);
	});
};
