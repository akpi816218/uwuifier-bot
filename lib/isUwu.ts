export function isUwu(text: string): boolean {
	text = text.toLowerCase();
	for (const pattern of UwuPatterns)
		if (pattern.test(text)) return true;
		else continue;
	return false;
}

export const UwuPatterns = [
	/\buwu\b/,
	/\bowo\b/,
	/\s>?:3\s/,
	/\s>?:3$/,
	/^>?:3$/,
	/^>?:3\s/,
	/\bnya+\b/,
	/\b\*blush/
];
