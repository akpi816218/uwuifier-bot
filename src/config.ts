import { PermissionFlagsBits, PermissionsBitField } from 'discord.js';

export const clientId = '1250563292653551740';

export const permissionsBits = new PermissionsBitField().add(
	PermissionFlagsBits.ReadMessageHistory,
	PermissionFlagsBits.SendMessages,
	PermissionFlagsBits.SendMessagesInThreads,
	PermissionFlagsBits.ViewChannel
).bitfield;

export const PORT = 8000;
