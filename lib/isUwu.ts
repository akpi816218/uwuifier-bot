export function isUwu(text: string): boolean {
	text = text.toLowerCase();
	for (const pattern of UwuPatterns)
		if (pattern.test(text)) return true;
		else continue;
	return false;
}

export const UwuPatterns = [/\buwu\b/, /\b>?:3\b/, /\bny(a)+\b/, /\b\*blush/];
