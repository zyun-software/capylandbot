export function alertUtility(message: any, callback?: () => void): void {
	const webApp = window?.Telegram?.WebApp;
	if (webApp) {
		webApp.showAlert(message, callback);
	} else {
		alert(message);
		if (callback) {
			callback();
		}
	}
}

export async function confirmUtility(
	message: any,
	callback: (yes?: boolean) => Promise<void> | void = () => {}
): Promise<boolean> {
	const webApp = window?.Telegram?.WebApp;
	if (webApp) {
		const yes = await new Promise<boolean>((resolve) => {
			webApp.showConfirm(message, async (yes) => {
				resolve(!!yes);
				await callback(yes);
			});
		});

		return yes;
	} else {
		const yes = confirm(message);
		await callback(yes);
		return yes;
	}
}

export function hideMainButton(): void {
	const webApp = window?.Telegram?.WebApp;
	if (webApp) {
		webApp.MainButton.hide();
	}
}

export function hideBackButton(): void {
	const webApp = window?.Telegram?.WebApp;
	if (webApp) {
		webApp.BackButton.hide();
	}
}

type HandlerType = () => Promise<void> | void;

let mainButtonHandler: HandlerType | null = null;
export function showMainButton(text: string, handler: HandlerType): void {
	const webApp = window?.Telegram?.WebApp;
	if (webApp) {
		const MainButton = webApp.MainButton;
		MainButton.text = text;
		if (mainButtonHandler) {
			MainButton.offClick(mainButtonHandler);
		}
		mainButtonHandler = handler;
		MainButton.onClick(handler);
		MainButton.show();
	}
}

let backButtonHandler: HandlerType | null = null;
export function showBackButton(handler: HandlerType): void {
	const webApp = window?.Telegram?.WebApp;
	if (webApp) {
		const BackButton = webApp.BackButton;
		if (backButtonHandler) {
			BackButton.offClick(backButtonHandler);
		}
		backButtonHandler = handler;
		BackButton.onClick(handler);
		BackButton.show();
	}
}
