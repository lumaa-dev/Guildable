const DiscordModule = require("discord.js");
//const canvacord = require("canvacord");
/*const config = require("./config.json");
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');*/

module.exports = {
    /**
     * Creates a poll with a few parameters
     * @param {*} channel The channel the poll will be sent
     * @param {*} question The question
     * @param {*} choice1 Please use this format "[Emoji1] - [option1]"
     * @param {*} choice2 Please use this format "[Emoji2] - [option2]"
     * @returns An embed with a question and reactions     
     */
    createPoll(channel = DiscordModule.GuildChannel, question, choice1 = "✅ - Yes", choice2 = "❌ - No",) {
        //Choices format : "[emoji] - [option]"
        if (!question || !channel) return console.error("Error in createPoll()")
        var emoji1 = choice1.charAt(0)
        var emoji2 = choice2.charAt(0)
        let poll = this.createEmbed(question, `${choice1}\n${choice2}`, "Poll", this.randomColor(), true)
        //console.log(`${emoji1} / ${emoji2}`)
        channel.send({ embeds: [ poll ] }).then(async (message) => {
            await message.react(emoji1)
            await message.react(emoji2)
        }).then(() => {
            return console.log("Poll sent perfectly")
        }).catch(console.error)
    },

    /**
     * Creates a random color
     */
    randomColor() {
      var color = Math.floor(Math.random() * 16777215).toString(16);
      color = "#" + ("000000" + color).slice(-6);
      console.log("Created custom color " + color)
      return color;
    },

    /**
     * Creates a channel in a guild
     * @param {*} type "text" - Text | "voice" - Voice | "category" - Category
     * @param {*} nsfw If the channel is "Not Safe For Work"
     * @param {*} category A Discord category to put the new channel in
     * @param {*} slowmode The time in second of slowmode
     */
    async createChannel(guild = DiscordModule.Guild, name, type = "text", nsfw = false, slowmode = 0, category = DiscordModule.GuildChannel) {
        if (!guild.me.permissions.has("MANAGE_CHANNELS")) return console.error("Permission missing in " + guild.id)
        await guild.channels.create(name, {
            type: type,
            nsfw: nsfw,
            rateLimitPerUser: slowmode,
            parent: category,
            reason: "Utils | _Lumination#5240"
        });
        
        return console.log("Created channel");
    },
    
    /**
     * Locks a certain channel
     * @param {*} channel The channel you want to lock
     */
     async lockChannel(channel) {
        if (!channel) return console.error("No channel to lock")

        await channel.permissionOverwrites.create(channel.guild.roles.everyone, { SEND_MESSAGES: false, SPEAK: false, CONNECT: false });
        return console.log("Locked channel")
    },

    /**
     * Unlock a certain channel
     * @param {*} channel The channel you want to lock
     */
    async unlockChannel(channel) {
        if (!channel) return console.error("No channel to unlock")

        await channel.permissionOverwrites.create(channel.guild.roles.everyone, { SEND_MESSAGES: true, SPEAK: true, CONNECT: true });
        return console.log("Unlocked channel")
    },

    /**
     * Do a YouTube search
     * @param {*} query The search
     * @returns A dictionary of a YouTube video's informations
     */
    /*async youtubeSearch(query) {
        const videoFinder = async (query) => {
            const videoResult = await ytSearch(query);
            return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
        }
        const video = await videoFinder(query);
        //console.log(video)

        if (video) return video
        if (!video) return console.error("No YT videos found with \"" + query + "\"")
    },

    async playYT(voiceChannel, ytUrl, optimizeData = true) {
        //const remain = 0
        if (!voiceChannel) return console.error("No user found")
        var voice = voiceChannel
        if (!voice) return console.error("No voice channel found")

        var connection = await voice.join()
        connection.voice.setSelfDeaf(optimizeData)
        console.log("Joined voice channel")
        
        const stream = ytdl(ytUrl, {filter: 'audioonly'});
        connection.play(stream, {seek: 0, volume: 1})
        .on('finish', () => {
            voice.leave()
        })
        console.log("Playing sound")
    },*/
    
    /**
    * A quick line to create a Discord client
    * @returns The client
    **/
    createClient(Discord = DiscordModule) {
        if (!Discord | typeof Discord == "undefined") return console.error("Discord not specified in createClient()")
        const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_PRESENCES] });
        if (!client || typeof client == "undefined") return console.error("Discord changed the way to get new clients")
        return client
    },

    /**
     * Imitate a user's message
     */
    async sudo(message, args) {
        const target = message.mentions.users.first() || message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(member => member.user.username === args.join(" ").split(", ")[0])
        if (!target) return message.channel.send("Unkown member")

        const guildMember = message.guild.members.cache.get(target.id)
        let webhook
        const webhooks = await message.channel.fetchWebhooks()

        if (webhooks.first()) {
            webhook = webhooks.first()
        } else {
            message.channel.createWebhook("sudo")
            const newWebhooks = await message.channel.fetchWebhooks()
            webhook = newWebhooks.first()
        }

        webhook.send(args.join(" ").split(", ").slice(1).join(", "),{
            avatarURL: guildMember.user.avatarURL(),
            username: guildMember.nickname || guildMember.user.username
        })
    },

    correctEpoch(epoch = "1533135944000") {
        epoch = epoch.toString()
        if (epoch.length !== 13) return console.error("Incorrect Epoch")

        splitted = [],
        sNumber = epoch

        for (var i = 0, len = sNumber.length - 3; i < len; i += 1) {
            splitted.push(+sNumber.charAt(i));
        }

        const time = splitted.join("")
        return time;
    },

    /**
     * Get the user's creation timestamp
     */
    getCreation(message, args) {
        const messagePing = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.guild.members.cache.get(message.author.id)
        const date = Date.parse(messagePing.user.createdAt).toString()
        
        const timestamp = this.correctEpoch(date)
        return timestamp
    },

    /**
     * Get the user's join timestamp
     */
    getJoined(message, args) {
        const messagePing = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.guild.members.cache.get(message.author.id)
        //const date = Date.parse(messagePing.guild.joinedTimestamp).toString()
        
        const timestamp = this.correctEpoch(messagePing.guild.joinedTimestamp)
        return timestamp
    },

    async getSpotify(user, channel, image = false) {
        if (!user.presence || typeof user.presence == "undefined") return console.error("No presences")
        await user.presence.activities.forEach(async (activity) => {
            if (activity.type === 'LISTENING' && activity.name === 'Spotify' && activity.assets !== null) {
                //console.log(activity)
                let trackIMG = `https://i.scdn.co/image/${activity.assets.largeImage.slice(8)}`;
                let trackURL = `https://open.spotify.com/track/${activity.syncId}`;

                let trackName = activity.details;
                let trackAuthor = activity.state;
                let trackAlbum = activity.assets.largeText;
                let trackStart = activity.timestamps.start;
                let trackEnd = activity.timestamps.end;

                trackAuthor = trackAuthor.replace(/;/g, ",")

                const spotifyBtn = new DiscordModule.MessageButton()
                .setURL(trackURL)
                .setStyle("LINK")
                .setLabel(`Listen to ${trackName} on Spotify`)

                const spotifyBtns = new DiscordModule.MessageActionRow()
                .addComponents([spotifyBtn])

                if (image === false) {
                    const spotifyEmbed = new DiscordModule.MessageEmbed()
                    .setAuthor(`${user.user.username} on Spotify`, "", trackURL)
                    .setColor("#1DB954")
                    .setThumbnail(trackIMG)
                    .addField("Playing:", `__${trackName}__`, true)
                    .addField("Artists:", `__${trackAuthor}__`, true)
                    .addField("Album Name:", `__${trackAlbum}__`, true)
                    .addField("Started", `<t:${this.correctEpoch(await this.humanTimeToEpoch(trackStart))}:R>`, true)
                    .addField("Ending", `<t:${this.correctEpoch(await this.humanTimeToEpoch(trackEnd))}:R>`, true)

                    return channel.send({
                        embeds: [
                            spotifyEmbed
                        ],
                        components: [
                            spotifyBtns
                        ]
                    })
                } else if (image === true) {
                    const card = new canvacord.Spotify()
                    .setAuthor(trackAuthor)
                    .setAlbum(trackAlbum)
                    .setStartTimestamp(this.humanTimeToEpoch(trackStart, false))
                    .setEndTimestamp(this.humanTimeToEpoch(trackEnd, false))
                    .setImage(trackIMG)
                    .setTitle(trackName);

                    card.build()
                    .then(buffer => {
                        /* const spotifyIMG = */canvacord.write(buffer, "assets/spotify.png");
                        const img = new DiscordModule.MessageAttachment().setFile("C:/Users/Utilisateur/Discord/Bots/keymey_dev/assets/spotify.png")
                        channel.send({files:[img],components:[spotifyBtns]})
                    });
                } else {
                    console.error("Unknown \"image\" value")
                }
            }
        })
    },

    /**
     * Get a user's latest presence
     * @param i The [i]th activity
     * @returns {*} {
            title: activity.name,
            type: activity.type,
            subtitle: activity.details,
            subsubtitle: activity.state,
            created: activity.createdTimestamp,
            timestamps: {
                start: activity.timestamps.start,
                end: activity.timestamps.end
            }
        }
     */
    async getLastPresence(user, i = 0) {
        if (user.presence == null || user.presence.id === "custom") return console.error("No presences")
        activity = await user.presence.activities[i]
        console.log(activity)
        if (!activity.timestamps) {
            const infos = {
                title: activity.name,
                type: activity.type,
                subtitle: activity.details,
                subsubtitle: activity.state,
                created: activity.createdTimestamp,
                timestamps: null
            }
            return infos
        } else if (activity.timestamps.start !== null && activity.timestamps.end !== null) {
            const infos = {
                title: activity.name,
                type: activity.type,
                subtitle: activity.details,
                subsubtitle: activity.state,
                created: activity.createdTimestamp,
                timestamps: {
                    start: activity.timestamps.start,
                    end: activity.timestamps.end
                }
            }
            return infos
        } else if (activity.timestamps.start !== null && activity.timestamps.end == null) {
            const infos = {
                title: activity.name,
                type: activity.type,
                subtitle: activity.details,
                subsubtitle: activity.state,
                created: activity.createdTimestamp,
                timestamps: {
                    start: activity.timestamps.start,
                    end: null
                }
            }
            return infos
        } else if (activity.timestamps == null) {
            const infos = {
                title: activity.name,
                type: activity.type,
                subtitle: activity.details,
                subsubtitle: activity.state,
                created: activity.createdTimestamp,
                timestamps: {
                    start: null,
                    end: activity.timestamps.end
                }
            }
            return infos
        }
    },

    /**
     * Set the first character in caps
     * @example const string = setFirstCaps("UTILS IS A GOOD MODULE")
     * if (string == "Utils is a good module") console.log("Test succeed")
     */
    setFirstCap(string) {
        string = string.toLowerCase()

        let firstChar = string.charAt(0).toUpperCase()
        let end = string.substring(1)

        string = `${firstChar}${end}`
        return string
    },

    /**
     * Get a user's badges
     * @returns A string containing every badges of a user
     */
    async getBadges(user) {
        /*
        VERIFIED_BOT
        HOUSE_BRAVERY
        HOUSE_BALANCE
        HOUSE_BRILLIANCE
        DISCORD_EMPLOYEE
        PARTNERED_SERVER_OWNER
        HYPESQUAD_EVENTS
        BUGHUNTER_LEVEL_1
        BUGHUNTER_LEVEL_2
        EARLY_SUPPORTER
        TEAM_USER
        EARLY_VERIFIED_BOT_DEVELOPER
        DISCORD_CERTIFIED_MODERATOR
        */

        const badges = user.user.flags || await user.fetchFlags();
        r = "";

        badges.toArray().forEach((badge) => {
            badge = this.setFirstCap(badge.toString().replace("_", " "));
            r = `${r}${badge}\n`
        })
        return r;
    },

    createButton(text, id, style, emoji = undefined, url = undefined) {
        if (url !== undefined) style = "LINK"

        const btn = new DiscordModule.MessageButton()
        .setCustomID(id)
        .setLabel(text)
        .setStyle(style)
        .setEmoji(emoji)
        .setURL(url)
    },

    snowflakeToCreation(snowflake) {
        if (!snowflake || typeof snowflake == "undefined" || snowflake < 4194304) return console.error("No valid snowflakes provided")

        const epochwords = new Date(snowflake / 4194304 + 1420070400000).toString();
        var epochunix = Date.parse(epochwords).toString();

        const epoch = this.correctEpoch(epochunix)
        return epoch;
    },

    humanTimeToEpoch(humanTime, correct = true) {
        date = new Date(humanTime); // Your timezone!
        epoch = date.getTime()/1000.0;
        epoch = epoch.toString().replace(".", "")
        if (correct === true) epoch = this.correctEpoch(epoch)

        return epoch
    },

    async calculate(operation) {
        if (typeof operation !== "string") return null;
        o = operation.replace(" ", "")
        o = o.replace(",", ".")
        if (o.match(/^(\d(\.\d)?)+(?:[-+*\/]+\d+(?:\.\d+)?(?:=\d+(?:\.\d+)?)?)$/)) {
            res = o.split(/^(\d(\.\d)?)+(?:[-+*\/]+\d+(?:\.\d+)?)/)
            const userResult = res[res.length - 1]
            o = o.split(/(?:=\d+(?:\.\d+)?)?$/)[0]
            const result = await eval(o)
            if (userResult !== "") {
                if (userResult.split("=")[1] == `${result}`) return `good|${result}`;
                if (userResult.split("=")[1] !== `${result}`) return `bad|${result}|${userResult.split("=")[1]}`;
            } else {
                return `${result}`;
            }
        } else {
            return null;
        }
    },

    async prettyMaths(operation) {
        const signs = ["+","-","*","/","="]
        signs.forEach((sign) => {
            operation = operation.replace(sign, ` ${sign} `)
        })
        return operation;
    },

    async addEmoji(guild, attachment, name) {
        try {
            const emoji = await guild.emojis.create(attachment, name.replace(" ", ""), { reason: "_Lumination#5240 | Utils"})
            if (emoji.animated) prefix = `<:a`
            else prefix = ""
            return `<${prefix}:${name.replace(" ", "")}:${emoji.id}>`
        } catch (e) {
            console.error(e);
        }
    },

    async setStatus(client, name, type = "PLAYING") {
        await client.user.setActivity(name, { type: type })
    }
}

/*const remain = 60;
            while (remain > 0) {
                setTimeout(() => {
                    remain = remain - 1;
                    console.log(remain + " seconds remaining")
                })
            }
            if (remain <= 0) */