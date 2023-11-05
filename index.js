require("dotenv").config();
const utils = require("./config/utils.json");
const mongoose = require("mongoose");
const connectDb = require("./config/connectDb");
const GuildModel = require("./models/guildModel");
const scrapeData = require("./scraper");
const Discord = require("discord.js");
const { Client, GatewayIntentBits } = require("discord.js");

// Database connection
connectDb();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent],
  partials: ["CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION", "USER"]
});


const prefix = utils.prefix;

client.on("messageCreate", async (message) => {
  if (!message.author.bot) {
    if (message.content.toLowerCase().startsWith(`${prefix}setchannel`)) {
      try {
        const guildId = message.guild.id;
        const channelId = message.channel.id;
        const alreadyExist = await GuildModel.findOne({ guildId });
        if (alreadyExist) {
          alreadyExist.channelId = channelId;
          await alreadyExist.save();
          await message.reply(`${utils.emoji.success} | Successfully updated the channel!`);
        } else {
          const newGuild = new GuildModel({ guildId, channelId });
          await newGuild.save();
          await message.reply(`${utils.emoji.success} | Successfully added the channel!`);
        }

      } catch (error) {
        try {
          await message.reply(`${utils.emoji.error} | ${error.message}!`);
        } catch (error) {
          console.log(error.message);
        }

      }
    }
  }
});

client.on("ready", (client) => {
  console.log(`${client.user.tag} is online`);
  setInterval(async () => {
    let flag = 0;
    let guilds = client.guilds.cache.map(guild => guild.id);
    let guildDb = await GuildModel.find({});
    for (let i = 0; i < guildDb.length; i++) {
      for (let j = 0; j < guilds.length; j++) {
        if (guildDb[i].guildId === guilds[j]) {
          flag = 1;
          break;
        }
      }
      if (flag === 0) {
        try {
          await GuildModel.deleteOne({ guildId: guildDb[i].guildId });
        } catch (error) {
          console.log(error.message);
        }
      }
      flag = 0;
    }

    scrapeData().then(async (data) => {
      if (data) {
        try {
          let sendChannels = await GuildModel.find({});
          for (let i = 0; i < sendChannels.length; i++) {
            await client.channels.cache.get(sendChannels[i].channelId).send({
              embeds: [
                new Discord.EmbedBuilder()
                  .setTitle(`${utils.emoji.notice} | ${data[0].head}`)
                  .setDescription(`Details - ${data[0].more}`)
                  .setColor('#B2DDF2')
              ]
            });
          }
        } catch (error) {
          console.log(error.message);
        }

      }
    })
  }, 60000);

});



client.login(process.env.TOKEN);