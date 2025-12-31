const { REST, Routes } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');
require('dotenv').config();

const token = process.env.BOT_TOKEN;
const clientId = process.env.CLIENT_ID;

const commands = [
    new SlashCommandBuilder()
        .setName('setupticket')
        .setDescription('يحدد قناة التذاكر ويرسل رسالة الفتح.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('القناة التي سيتم إرسال رسالة التذكرة بها')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('إدارة القائمة السوداء لفتح التذاكر')
        .addSubcommand(subcommand =>
            subcommand.setName('add')
                .setDescription('يضيف شخصاً إلى القائمة السوداء')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('العضو المراد إضافته')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('يزيل شخصاً من القائمة السوداء')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('العضو المراد إزالته')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('list')
                .setDescription('يعرض أعضاء القائمة السوداء')),
    new SlashCommandBuilder()
        .setName('reopen')
        .setDescription('يعيد فتح التذكرة المغلقة'),
    new SlashCommandBuilder()
        .setName('close')
        .setDescription('يغلق التذكرة الحالية'),
    new SlashCommandBuilder()
        .setName('system')
        .setDescription('يغير حالة نظام التذاكر (مفتوح/مغلق).')
        .addStringOption(option =>
            option.setName('status')
                .setDescription('الحالة المطلوبة (online أو offline)')
                .setRequired(true)
                .addChoices(
                    { name: 'Online', value: 'online' },
                    { name: 'Offline', value: 'offline' }
                )),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();