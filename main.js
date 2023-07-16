const Discord = require("discord.js");
const Utils = require("./util/func");

const client = Utils.createClient(Discord);
const config = require("./config.json");
const uptime = Utils.correctEpoch(new Date(Date.now()).getTime());

client.once("ready", async () => {
	await Utils.setStatus(
		client,
		`${client.guilds.cache.size} servers - ${config.version}`,
		"WATCHING"
	);
	console.log(`${client.user.username} is logged`);
});

client.on("guildCreate", async (guild) => {
	await Utils.setStatus(
		client,
		`${client.guilds.cache.size} servers - ${config.version}`,
		"WATCHING"
	);
});

client.on("guildDelete", async (guild) => {
	await Utils.setStatus(
		client,
		`${client.guilds.cache.size} servers - ${config.version}`,
		"WATCHING"
	);
});

client.on("messageCreate", async (message) => {
	if (
		message.content.startsWith("!deploy") === true &&
		message.author.id == config.ownerId
	) {
		var a = [];
		config.cmds.forEach((cmd) => {
			a.push(cmd);
		});
		config.cmdsAdmin.forEach((cmd) => {
			a.push(cmd);
		});
		await client.guilds.cache.get(message.guild.id)?.commands.set(a);
		console.log("Initialized all commands");
		message.react("✅");
	} else if (
		message.content === "!gdeploy" &&
		message.author.id == config.ownerId
	) {
		await client.application?.commands.set(config.cmds);
		console.log("Initialized everywhere default commands");
		message.react("✅");
	}
});

client.on("interactionCreate", async (interaction) => {
	if (config.protect == true && interaction.member.user.id !== config.ownerId)
		return interaction.reply({
			ephemeral: true,
			content: `The bot is in protection mode.`,
		});
	if (interaction.isCommand()) {
		if (
			interaction.commandName == "status" &&
			interaction.user.id == config.ownerId
		) {
			await interaction.defer({ ephemeral: true });
			let name = interaction.options.get("status").value;
			let type = interaction.options.get("type")?.value ?? "PLAYING";
			await Utils.setStatus(client, name, type);
			await interaction.editReply({
				ephemeral: true,
				content: `C'est bon y'a le nouveau status :wink:`,
			});
			console.log("changed status to " + name + " with the " + type + " type");
		} else if (
			interaction.commandName == "leave" &&
			interaction.user.id == config.ownerId
		) {
			let guild = await client.guilds.cache.get(
				await interaction.options.get("guild_id").value
			);
			guild.leave();
			interaction.reply({
				ephemeral: true,
				content: `Je suis plus dans ${guild.name}`,
			});
		} else if (interaction.commandName === "guilds_in") {
			await interaction.reply(
				"Loading " + client.guilds.cache.size + " guilds..."
			);
			var allGuilds = "";
			lineLimit = 0;
			const max = client.guilds.cache.size;
			a = 0;
			b = max / 5;
			b = `${b}`;
			c = 0;
			client.guilds.cache.each((guild) => {
				allGuilds = `${allGuilds}\n${guild.name} (${guild.memberCount} members | ${guild.id})`;
				lineLimit = lineLimit + 1;
				c = c + 1;
				if (lineLimit >= 5 || c >= max) {
					lineLimit = 0;
					a = a + 1;
					interaction.channel.send({
						embeds: [
							new Discord.MessageEmbed()
								.setTitle("Guildable is in " + max + " guilds")
								.setDescription("```" + allGuilds + "```")
								.setFooter(`${a}/${Math.round(b)}`),
						],
					});
					allGuilds = "";
				}
			});
			await interaction.editReply(
				`<t:${Utils.correctEpoch(
					new Date(Date.now()).getTime()
				)}> had ${max} guilds`
			);
		} else if (interaction.commandName == "kick") {
			if (interaction.member.permissions.has(["KICK_MEMBERS"])) {
				const { user } = interaction.options.get("user");
				try {
					const member = interaction.guild.members.cache.get(user.id);
					const reason =
						interaction.options.get("reason")?.value ??
						"*Any reasons provided*";
					if (member.kickable === true) {
						const kickEmbed = new Discord.MessageEmbed()
							.setTitle(
								`<:g_yes:870871799519412224> ${member.user.username} has been kicked.`
							)
							.addField(
								"User kicked:",
								`<@${member.user.id}> (${member.user.id})`,
								true
							)
							.addField("Kicked by:", `<@${interaction.user.id}>`, true)
							.addField("Reason:", reason);
						interaction.reply({ embeds: [kickEmbed] });
						member.send(`You got kicked from __${interaction.guild.name}__.`);
						member.kick();
					} else {
						const notKickEmbed = new Discord.MessageEmbed()
							.setTitle("You cannot kick that user!")
							.setDescription(
								"He's maybe having a higher role than you.\nOr just that you can't kick him."
							);
						interaction.reply({
							content: `<@${user.id}> :eyes:`,
							embeds: [notKickEmbed],
						});
					}
				} catch (e) {
					interaction.reply({
						ephemeral: true,
						content: `We got an internal problem:\n__${e}__\n\nPlease report this as fast as you can!`,
					});
					console.error(e);
				}
			} else {
				interaction.reply({
					ephemeral: true,
					content: `You don't have the required permissions.`,
				});
			}
		} else if (interaction.commandName == "ban") {
			if (interaction.member.permissions.has(["BAN_MEMBERS"])) {
				const { user } = interaction.options.get("user");
				const member = interaction.guild.members.cache.get(user.id);
				const reason =
					interaction.options.get("reason")?.value ?? "*Any reasons provided*";
				if (member.bannable === true) {
					const banEmbed = new Discord.MessageEmbed()
						.setTitle(
							`<:g_yes:870871799519412224> ${member.user.username} has been banned.`
						)
						.addField(
							"User banned:",
							`<@${member.user.id}> (${member.user.id})`,
							true
						)
						.addField("Banned by:", `<@${interaction.user.id}>`, true)
						.addField("Reason:", reason);
					interaction.reply({ embeds: [banEmbed] });
					member.send(`You got banned from __${interaction.guild.name}__.`);
					member.ban();
				} else {
					const notBanEmbed = new Discord.MessageEmbed()
						.setTitle("You cannot ban that user!")
						.setDescription(
							"He's maybe having a higher role than you.\nOr just that you can't ban him."
						);
					interaction.reply({
						content: `<@${user.id}> :eyes:`,
						embeds: [notBanEmbed],
					});
				}
			} else {
				interaction.reply({
					ephemeral: true,
					content: `You don't have the required permissions.`,
				});
			}
		} else if (interaction.commandName == "mute") {
			if (interaction.member.permissions.has(["MUTE_MEMBERS"])) {
				const { user } = interaction.options.get("user");
				const member = interaction.guild.members.cache.get(user.id);
				const reason =
					interaction.options.get("reason")?.value ?? "*Any reasons provided*";
				if (member.manageable !== true)
					return interaction.reply({
						ephemeral: true,
						content: `You don't have the required permissions.`,
					});
				muteRole = interaction.guild.roles.cache.find(
					(role) => role.name == "Mute"
				);
				createdRole = false;
				if (!muteRole || typeof muteRole === "undefined") {
					muteRole = await interaction.guild.roles.create({
						name: "Mute",
						color: "RED",
						hoist: true,
						mentionable: false,
						permissions: ["CREATE_INSTANT_INVITE", "CONNECT"],
					});
					createdRole = true;
				}
				interaction.guild.channels.cache.forEach(async (_channel) => {
					if (
						_channel.type == "GUILD_TEXT" ||
						_channel.type == "GUILD_NEWS" ||
						_channel.type == "GUILD_STORE" ||
						_channel.type == "GUILD_CATEGORY"
					) {
						await _channel.permissionOverwrites.create(
							muteRole,
							{
								SEND_MESSAGES: false,
								ADD_REACTIONS: false,
								USE_PUBLIC_THREADS: false,
								USE_PRIVATE_THREADS: false,
							},
							{ type: 0 }
						);
					} else if (
						_channel.type == "GUILD_VOICE" ||
						_channel.type == "GUILD_STAGE_VOICE"
					) {
						await _channel.permissionOverwrites.create(
							muteRole,
							{ SPEAK: false, STREAM: false, REQUEST_TO_SPEAK: false },
							{ type: 0 }
						);
					}
				});
				if (member.roles.cache.has(muteRole.id) == true)
					return interaction.reply({
						ephemeral: true,
						content: `<@${member.user.id}> is already muted.`,
					});
				member.roles.add(muteRole);
				const muteEmbed = new Discord.MessageEmbed()
					.setTitle(
						`<:g_yes:870871799519412224> ${member.user.username} has been muted`
					)
					.setFooter(
						`Created role: ${createdRole ? `Yes (${muteRole.id})` : `No`}`
					)
					.addField("User muted:", `<@${member.user.id}>`, true)
					.addField("Muted by:", `<@${interaction.member.user.id}>`, true)
					.addField("Role added", `<@&${muteRole.id}>`, true)
					.addField("Reason:", reason);

				interaction.reply({ embeds: [muteEmbed] });
			} else {
				interaction.reply({
					ephemeral: true,
					content: `You don't have the required permissions.`,
				});
			}
		} else if (interaction.commandName == "vcmute") {
			if (interaction.member.permissions.has(["MUTE_MEMBERS"])) {
				const { user } = interaction.options.get("user");
				const member = interaction.guild.members.cache.get(user.id);
				const reason =
					interaction.options.get("reason")?.value ?? "*Any reasons provided*";
				if (member.manageable !== true)
					return interaction.reply({
						ephemeral: true,
						content: `You don't have the required permissions.`,
					});
				const { value: muteBool } = interaction.options.get("mute");
				const muteWord = muteBool ? "muted" : "unmuted";
				member.voice
					.setMute(muteBool)
					.then(() => {
						const vcmuteEmbed = new Discord.MessageEmbed()
							.setTitle(
								`<:g_yes:870871799519412224> ${user.username} has been vocally ${muteWord}`
							)
							.addField(`User vocally ${muteWord}`, `<@${user.id}>`, true)
							.addField(
								`Vocally ${muteWord} by:`,
								`<@${interaction.member.user.id}>`,
								true
							)
							.addField("Reason:", reason);
						interaction.reply({ embeds: [vcmuteEmbed] });
					})
					.catch(() => {
						return interaction.reply({
							ephemeral: true,
							content: `<@${member.user.id}> is not in a voice channel.`,
						});
					});
			}
		} else if (interaction.commandName == "clear") {
			if (interaction.member.permissions.has(["MANAGE_CHANNELS"])) {
				const _channel =
					interaction.options.get("channel")?.channel ?? interaction.channel;
				const clearedChannel = await _channel.clone({
					position: _channel.rawPosition,
				});
				_channel.delete();

				const newChannelEmbed = new Discord.MessageEmbed()
					.setTitle("Channel cleared perfectly")
					.setDescription(
						`Cleared by <@${
							interaction.member.user.id
						}> <t:${Utils.correctEpoch(new Date(Date.now()).getTime())}:R>`
					)
					.setColor(Utils.randomColor());
				clearedChannel.send({ embeds: [newChannelEmbed] });
			}
		} else if (interaction.commandName == "whois") {
			const user = interaction.options.get("user")?.user ?? interaction.user;
			const member = await interaction.guild.members.cache.get(user.id);

			const created = Utils.correctEpoch(Date.parse(user.createdAt).toString());
			const joined = Utils.correctEpoch(member.guild.joinedTimestamp);
			const _roles = member._roles;

			__roles = [];
			_roles.forEach((role) => {
				__roles.push(`<@&${role}>`);
			});
			const roles = __roles.join(", ") ?? "*No roles found*";

			const whoisEmbed = new Discord.MessageEmbed()
				.setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
				.setFooter(`ID: ${user.id}`)
				.addField("Account Created", `<t:${created}:R>`, true)
				.addField("Joined", `<t:${joined}:R>`, true)
				.addField("Roles", roles, true)
				.addField("User", `<@${user.id}>`)
				.setColor("RANDOM");

			interaction.reply({ ephemeral: true, embeds: [whoisEmbed] });
		} else if (interaction.commandName == "help") {
			showHelp(interaction, interaction.user);
		} else if (interaction.commandName == "lock") {
			if (!interaction.member.permissions.has(["MANAGE_CHANNELS"]))
				return interaction.reply({
					ephemeral: true,
					content: `You don't have the required permissions.`,
				});
			const channel =
				interaction.options.get("channel")?.channel ?? interaction.channel;
			const perms = channel
				.permissionsFor(interaction.guild.roles.everyone)
				.has("SEND_MESSAGES");
			if (perms === false) Utils.unlockChannel(channel);
			if (perms === true) Utils.lockChannel(channel);

			interaction.reply({
				content: `<:g_yes:870871799519412224> ${
					perms ? "Locked" : "Unlocked"
				} successfully <#${channel.id}>`,
				ephemeral: true,
			});
			if (channel !== interaction.channel) channel.send("Channel unlocked");
		} else if (interaction.commandName == "botinfo") {
			const infoEmbed = new Discord.MessageEmbed()
				.setTitle(client.user.tag)
				.setDescription(
					`Guildable is a moderation Discord bot made by <@${config.ownerId}> *in his free time*,\nafter a *non-existant* blowing up of [Keymey](https://top.gg/bot/836701555586891786), he decided to do the thing he would've never done : __A moderation bot__.\n\nAbout 5 days after he release **Proto.1.0.0**`
				)
				.setFooter(`Version: ${config.version}`);
			interaction.reply({
				ephemeral: true,
				content: 'Also read my "About Me" section!',
				embeds: [infoEmbed],
			});
		} else if (interaction.commandName == "unban") {
			if (interaction.member.permissions.has(["BAN_MEMBERS"])) {
				const { value: user } = interaction.options.get("user");
				const reason =
					interaction.options.get("reason")?.value ?? "*Any reasons provided*";
				interaction.guild.bans.remove(user).then((_user) => {
					const unbanEmbed = new Discord.MessageEmbed()
						.setTitle(`<:g_yes:870871799519412224> ${user} has been unbanned.`)
						.addField("User unbanned:", `${user}`, true)
						.addField("Unbanned by:", `<@${interaction.member.user.id}>`, true)
						.addField("Reason:", reason);

					interaction.reply({ embeds: [unbanEmbed] });
				});
			} else {
				return interaction.reply({
					ephemeral: true,
					content: `You don't have the required permissions.`,
				});
			}
		} else if (interaction.commandName == "ticket") {
			if (interaction.member.permissions.has(["MANAGE_CHANNELS"])) {
				const title =
					interaction.options.get("title")?.value ?? "Create a ticket";
				const description =
					interaction.options.get("description")?.value ??
					"Click on the button bellow to create a ticket.";
				const channel =
					interaction.options.get("channel")?.channel ?? interaction.channel;

				const ticketEmbed = new Discord.MessageEmbed()
					.setTitle(title)
					.setDescription(description)
					.setFooter("Using " + client.user.tag)
					.setColor("BLURPLE");

				const ticketBtn = new Discord.MessageActionRow().addComponents([
					new Discord.MessageButton()
						.setCustomId("createticket")
						.setStyle("PRIMARY")
						.setEmoji("✉️")
						.setLabel("Create a ticket"),
				]);

				interaction.defer();
				channel.send({ embeds: [ticketEmbed], components: [ticketBtn] });
				interaction.deleteReply();
			}
		}
	} else if (interaction.isSelectMenu()) {
		if (interaction.customId == "helpcmds") {
			getHelp(interaction, config.cmds);
		}
	} else if (interaction.isButton()) {
		if (interaction.customId == "createticket") {
			const thread = await interaction.channel.threads.create({
				name: `Ticket ${interaction.member.user.id}`,
				autoArchiveDuration: 60,
				reason: "Ticket button",
			});
			thread.send(
				`Explain your problem\n\n<@${interaction.member.user.id}> ||<@${interaction.guild.ownerId}>||`
			);
			interaction.channel.lastMessage.delete();
		}
	}
});

function showHelp(interaction, user, reply = true) {
	options = [];
	config.cmds.forEach((cmd) => {
		let option = {
			label: `/${cmd.name}`,
			description: cmd.description,
			value: cmd.name,
		};
		options.push(option);
	});

	const helpEmbed = new Discord.MessageEmbed()
		.setTitle("Help Menu")
		.setColor(Utils.randomColor())
		.setDescription(
			"Select a command in the menu bellow\n\nThis bot is entirely new, and you might not get along with the commands, so that's why we made the `/help` better than ever!"
		)
		.setFooter(user.tag, user.displayAvatarURL({ dynamic: true }));

	const cmdMenu = new Discord.MessageActionRow().addComponents(
		new Discord.MessageSelectMenu()
			.setCustomId("helpcmds")
			.setPlaceholder("Select a command")
			.addOptions(options)
	);

	if (reply === true)
		interaction.reply({ embeds: [helpEmbed], components: [cmdMenu] });
	if (reply === false)
		interaction.channel.send({ embeds: [helpEmbed], components: [cmdMenu] });
}

function getHelp(interaction, cmds) {
	const cmdhelp = interaction.values[0];
	cmds.forEach((cmd) => {
		if (cmdhelp == cmd.name) {
			if (typeof cmd.options !== "undefined") {
				output = "";
				cmd.options.forEach((option) => {
					if (option.required === true) {
						output = `${output} ${option.name} [Arg]`;
					}
				});
				var example = `${output}`;
			} else {
				var example = "";
			}
			cmdEmbed = new Discord.MessageEmbed()
				.setTitle(`/${cmd.name}`)
				.setDescription(
					`Description: \`${cmd.description}\`\nExample: \`/${cmd.name}${example}\``
				);
		}
	});
	if (typeof cmdEmbed !== "undefined") {
		interaction.reply({
			content: `Informations on /${cmdhelp}`,
			embeds: [cmdEmbed],
			ephemeral: true,
		});
	} else {
		interaction.reply({
			content: `There is no command called ${cmd.name}`,
			ephemeral: true,
		});
	}
}

client.on("messageCreate", (message) => {
	//console.log(message)
	if (
		message.content == "!help870762638789988422cmds" &&
		message.author.id == "836701555586891786"
	) {
		message.delete();
		showHelp(message, message.author, false);
	}
});

client.login(config.token);

// let kick = {
//     "name": "kick",
//     "description": "Kick a member of your server",
//     "options": [{
//         "name": "user",
//         "type": "USER",
//         "required": true
//     }, {
//         "name": "reason",
//         "type": "STRING",
//         "required": false
//     }]
// }
// let ban = {
//     "name": "ban",
//     "description": "Ban a member of your server",
//     "options": [{
//         "name": "user",
//         "type": "USER",
//         "required": true
//     }, {
//         "name": "reason",
//         "type": "STRING",
//         "required": false
//     }]
// }
// let mute = {
//     "name": "mute",
//     "description": "Mute a member of your server",
//     "options": [{
//         "name": "user",
//         "type": "USER",
//         "required": true
//     }, {
//         "name": "reason",
//         "type": "STRING",
//         "required": false
//     }]
// }
// let vcmute = {
//     "name": "vcmute",
//     "description": "Mute vocally a member of your server",
//     "options": [{
//         "name": "user",
//         "type": "USER",
//         "required": true
//     }, {
//         "name": "reason",
//         "type": "STRING",
//         "required": false
//     }]
// }
// let deaf = {
//     "name": "deaf",
//     "description": "Deaf a member of your server",
//     "options": [{
//         "name": "user",
//         "type": "USER",
//         "required": true
//     }, {
//         "name": "reason",
//         "type": "STRING",
//         "required": false
//     }]
// }
