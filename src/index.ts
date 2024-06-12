import 'dotenv/config';
import {
	ActivityType,
	Events,
	GatewayIntentBits,
	OAuth2Scopes,
	Partials,
	PresenceUpdateStatus
} from 'discord.js';
import { CommandClient } from './struct/discord/Extend';
import { Methods, createServer } from './server';
import { PORT, permissionsBits } from './config';
import { argv, stdout } from 'process';
import { logger } from './logger';
import Uwuifier from '@lib/uwuifier';
import { isUwu } from '@lib/isUwu';

argv.shift();
argv.shift();
if (argv.includes('-d')) {
	logger.level = 'debug';
	logger.debug('Debug mode enabled.');
}

const client = new CommandClient({
	intents: [
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent
	],
	partials: [Partials.Channel],
	presence: {
		activities: [
			{
				name: 'uwu',
				type: ActivityType.Playing
			}
		],
		afk: false,
		status: PresenceUpdateStatus.Online
	}
});
logger.debug('Created client instance.');

const server = createServer(
	{
		handler: (_req, res) =>
			res.redirect(
				client.generateInvite({
					permissions: permissionsBits,
					scopes: [OAuth2Scopes.Bot, OAuth2Scopes.Guilds, OAuth2Scopes.Identify]
				})
			),
		method: Methods.GET,
		route: '/invite'
	},
	{
		handler: (_req, res) => res.redirect('/status'),
		method: Methods.GET,
		route: '/'
	},
	{
		handler: (_req, res) => res.sendStatus(client.isReady() ? 200 : 503),
		method: Methods.GET,
		route: '/status'
	},
	{
		handler: (req, res) => {
			if (
				req.headers['content-type'] !== 'application/json' &&
				req.headers['content-type'] != undefined
			)
				res.status(415).end();
			else if (client.isReady())
				res
					.status(200)
					.contentType('application/json')
					.send({
						clientPing: client.ws.ping,
						clientReady: client.isReady(),
						commandCount: client.application!.commands.cache.size,
						guildCount: client.application!.approximateGuildCount,
						lastReady: client.readyAt!.valueOf(),
						timestamp: Date.now(),
						uptime: client.uptime
					})
					.end();
			else res.status(503).end();
		},
		method: Methods.GET,
		route: '/bot'
	},
	{
		handler: (req, res) => {
			if (
				req.headers['content-type'] !== 'application/json' &&
				req.headers['content-type'] != undefined
			)
				res.status(415).end();
			else if (client.isReady())
				res
					.status(200)
					.contentType('application/json')
					.send({
						commands: client.commands.map(command => ({
							data: command.data.toJSON(),
							help: command.help?.toJSON()
						})),
						timestamp: Date.now()
					})
					.end();
			else res.status(503).end();
		},
		method: Methods.GET,
		route: '/commands'
	}
);
logger.debug('Created server instance.');

client
	.on(Events.ClientReady, () => logger.info('Client#ready'))
	.on(Events.MessageCreate, async msg => {
		if (msg.author.bot || msg.content.length === 0) return;

		if (
			!msg.inGuild() ||
			msg.mentions.has(msg.client.user) ||
			isUwu(msg.content)
		)
			await msg.reply(Uwuifier.uwuifySentence(msg.content)).catch(() => {});
	})
	.on(Events.Debug, m => logger.debug(m))
	.on(Events.Error, m => logger.error(m))
	.on(Events.Warn, m => logger.warn(m));
logger.debug('Set up client events.');

await client
	.login(process.env.DISCORD_TOKEN)
	.then(() => logger.info(`Logged in as ${client.user!.username}.`));

process.on('SIGINT', () => {
	client.destroy();
	stdout.write('\n');
	logger.info('Destroyed Client.');
	process.exit(0);
});

server.listen(process.env.PORT ?? PORT);
logger.info(`Listening to HTTP server on port ${process.env.PORT ?? PORT}.`);

process.on('uncaughtException', logger.error);
process.on('unhandledRejection', logger.error);
logger.debug('Set up error handling.');
