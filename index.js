/*

-----------------------------------------------------------------
|                                                               |
|                                                               |
|      By Rolex 3amk    /     Tickets  Bot                      |
|                                                               |
|                                                               |
|                                                               |
|       you can call :                                          |
|                                                               |  
|      discord user : [ rolex_man_o ]                           |
|                                                               |
|                                                               |                                     يوجد شرح لكل شيئ في الاسفل
|  يمكنك التواصل نع اليوزر في الاعلى اذا احتجت اي مساعدة     |   
|                                                               |
|                                                               |   
|                                                               |
-----------------------------------------------------------------


*/



const fs = require("fs");
const {
    Client, GatewayIntentBits, Partials,
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
    StringSelectMenuBuilder, EmbedBuilder,
    PermissionsBitField, ChannelType,
    SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, Events
} = require("discord.js");
const { createTranscript } = require('discord-html-transcripts');
require('dotenv').config();

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const DB_FILE = './database.json';

// وظيفة لقراءة البيانات من ملف JSON
function readDB() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            fs.writeFileSync(DB_FILE, JSON.stringify({ ticketSystemStatus: 'online', blacklist: {}, tickets: {}, ticketCount: 0 }, null, 2), 'utf8');
        }
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (error) {
        console.error("Failed to read database file:", error);
        return { ticketSystemStatus: 'online', blacklist: {}, tickets: {}, ticketCount: 0 };
    }
}

// وظيفة لكتابة البيانات إلى ملف JSON
function writeDB(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error("Failed to write to database file:", error);
    }
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember]
});

const TICKET_CATEGORIES = config.ticketCategories;

client.once("ready", async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
    let db = readDB();

    if (interaction.isChatInputCommand()) {
        const { commandName, options } = interaction;

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "❌ ليس لديك صلاحية استخدام هذا الأمر.", ephemeral: true });
        }

        if (commandName === 'setupticket') {
            const channel = options.getChannel('channel');

            if (!channel || channel.type !== ChannelType.GuildText) {
                return interaction.reply({ content: "الرجاء تحديد قناة نصية صحيحة.", ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle(" 📜 قوانين نظام التذاكر") // وصف الايمبيد
                .setFooter({ text: "Your server Name", iconURL: client.user.displayAvatarURL() }) //text صورة الفوتر : خليها زي ماهي بس غير ال 
                .setThumbnail(client.user.displayAvatarURL()) // دي خليها زي ماهي
                .setColor(0x2f3136) // هنا لون الايمبيد            
                .setDescription(`                                                    
**• قبل فتح تذكرة، يرجى قراءة القوانين التالية بعناية:**

**1. الالتزام بالاحترام:**
> يمنع منعاً باتاً استخدام الألفاظ النابية، التهديد، أو أي شكل من أشكال الإساءة تجاه فريق الإدارة أو الأعضاء. أي مخالفة ستؤدي إلى عقوبات صارمة قد تصل إلى الإيقاف المؤقت أو الدائم.

**2. اختيار القسم الصحيح:**
> تأكد من اختيار القسم المناسب لمشكلتك أو استفسارك. سيساعد هذا في وصول تذكرتك إلى الشخص المختص بشكل أسرع.

**3. لا تكرر التذكرة:**
> يرجى فتح تذكرة واحدة فقط لكل مشكلة. فتح عدة تذاكر لنفس المشكلة سيؤدي إلى إغلاقها جميعاً. إذا لم يتم الرد عليك، يرجى الانتظار بصبر.

**4. لا تفتح تذكرة بلا سبب:**
> التذاكر مخصصة للمشاكل الجدية والاستفسارات المهمة. فتح تذكرة بدون سبب واضح أو للعبث سيضعك في القائمة السوداء لنظام التذاكر.

**5. العقوبات:**
> عدم الالتزام بهذه القوانين سيعرضك للعقوبات التالية:
> • **المخالفة الأولى:** تحذير.
> • **المخالفة الثانية:** إضافة إلى القائمة السوداء المؤقتة لنظام التذاكر.
> • **المخالفة الثالثة:** إضافة إلى القائمة السوداء الدائمة لنظام التذاكر.

**اختر القسم الذي يناسبك لفتح تذكرة:**
`);                                                    

            const menu = new StringSelectMenuBuilder()
                .setCustomId("ticketCategory")
                .setPlaceholder("اختر القسم...") // الكلمة المكتوبة في مكان اختيار التذاكر
                .addOptions(
                    ...Object.entries(TICKET_CATEGORIES).map(([key, cat]) => ({
                        label: cat.label,
                        value: key,
                        emoji: cat.emoji
                    }))
                );

            const row = new ActionRowBuilder().addComponents(menu);

            try {
                await channel.send({ embeds: [embed], components: [row] });
                await interaction.reply({ content: `✅ تم إرسال رسالة التذاكر بنجاح في القناة ${channel}.`, ephemeral: true }); // لما تعمل امر استلام التذاكر هيبعتلك الرسالة دي
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: "❌ حدث خطأ أثناء إرسال الرسالة.", ephemeral: true }); // اذا حصل خطئ حيبعت الرسالة دي
            }
        } else if (commandName === 'blacklist') { // امر البلاك لست
            const subcommand = options.getSubcommand();
            const user = options.getUser('user');
            const blacklistKey = user.id;
// الحاجات الي تحت مش مهمة مش محتاجة تعديل 
            if (subcommand === 'add') {
                db.blacklist[blacklistKey] = true;
                writeDB(db);
                await interaction.reply({ content: `✅ تم إضافة العضو ${user} إلى القائمة السوداء.`, ephemeral: true });
            } else if (subcommand === 'remove') {
                delete db.blacklist[blacklistKey];
                writeDB(db);
                await interaction.reply({ content: `✅ تم إزالة العضو ${user} من القائمة السوداء.`, ephemeral: true });
            } else if (subcommand === 'list') {
                const blacklistedUsers = Object.keys(db.blacklist);
                
                if (blacklistedUsers.length === 0) {
                    return interaction.reply({ content: "لا توجد أي أعضاء في القائمة السوداء.", ephemeral: true });
                }

                const listEmbed = new EmbedBuilder()
                    .setTitle("⚫ قائمة الأعضاء المحظورين")
                    .setDescription(blacklistedUsers.map(id => `<@${id}>`).join('\n'))
                    .setColor(0x000000);

                await interaction.reply({ embeds: [listEmbed], ephemeral: true });
            }
        } else if (commandName === 'close') {
            const ticketData = db.tickets[interaction.channel.id];
            if (!ticketData) {
                return interaction.reply({ content: "❌ هذه ليست تذكرة نشطة.", ephemeral: true });
            }
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels) && ticketData.ownerId !== interaction.user.id) {
                return interaction.reply({ content: "❌ ليس لديك الصلاحية لإغلاق هذه التذكرة.", ephemeral: true });
            }
            const modal = new ModalBuilder()
                .setCustomId('closeModal')
                .setTitle('أسباب إغلاق التذكرة');
            const reasonInput = new TextInputBuilder()
                .setCustomId('reasonInput')
                .setLabel("سبب الإغلاق")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
            await interaction.showModal(modal);

        } else if (commandName === 'reopen') {
            const ticketData = db.tickets[interaction.channel.id];
            if (!ticketData || ticketData.status !== 'closed') {
                return interaction.reply({ content: "❌ هذه التذكرة ليست مغلقة.", ephemeral: true });
            }
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels) && ticketData.ownerId !== interaction.user.id) {
                return interaction.reply({ content: "❌ ليس لديك الصلاحية لإعادة فتح هذه التذكرة.", ephemeral: true });
            }
            db.tickets[interaction.channel.id].status = 'open';
            writeDB(db);
            await interaction.channel.permissionOverwrites.edit(ticketData.ownerId, { ViewChannel: true, SendMessages: true });
            await interaction.reply({ content: '✅ تم إعادة فتح التذكرة بنجاح.', ephemeral: true });
            await interaction.channel.send({
                embeds: [new EmbedBuilder().setDescription(`✅ تم إعادة فتح التذكرة بواسطة <@${interaction.user.id}>.`).setColor(0x57f287)]
            });
            const ticketStatusChannel = client.channels.cache.get(config.ticketStatusChannelId);
            if (ticketStatusChannel) {
                await ticketStatusChannel.send({
                    embeds: [new EmbedBuilder().setDescription(`✅ التذكرة **${interaction.channel.name}** تم إعادة فتحها بواسطة <@${interaction.user.id}>.`).setColor(0x57f287)]
                });
            }
        } else if (commandName === 'system') {
            const status = options.getString('status');
            db.ticketSystemStatus = status;
            writeDB(db);

            let statusEmbed;
            let statusChannel = client.channels.cache.get(config.ticketSystemStatusChannelId);

            if (status === 'online') {
                statusEmbed = new EmbedBuilder()
                    .setTitle("🟢 نظام التذاكر متاح الآن")
                    .setDescription(`**تم فتح نظام التذاكر بواسطة:** <@${interaction.user.id}>. يمكن للأعضاء الآن فتح تذاكر جديدة.`)
                    .setColor(0x2ecc71);
            } else {
                statusEmbed = new EmbedBuilder()
                    .setTitle("🔴 نظام التذاكر مغلق مؤقتاً")
                    .setDescription(`**تم إغلاق نظام التذاكر بواسطة:** <@${interaction.user.id}>. لا يمكن للأعضاء فتح تذاكر جديدة حالياً.`)
                    .setColor(0xe74c3c);
            }

            if (statusChannel) {
                await statusChannel.send({ embeds: [statusEmbed] });
                await interaction.reply({ content: `✅ تم تغيير حالة النظام بنجاح إلى **${status}**.`, ephemeral: true });
            } else {
                await interaction.reply({ content: "❌ لم يتم العثور على قناة حالة النظام. يرجى التأكد من إضافة ID القناة في ملف config.json.", ephemeral: true });
            }
        }
    } else if (interaction.isStringSelectMenu() && interaction.customId === "ticketCategory") {
        const ticketSystemStatus = db.ticketSystemStatus || 'online';
        if (ticketSystemStatus === 'offline') {
            return interaction.reply({ content: "❌ نظام التذاكر مغلق حالياً، لا يمكنك فتح تذكرة جديدة.", ephemeral: true });
        }

        const userId = interaction.user.id;
        const isBlacklisted = db.blacklist[userId];

        if (isBlacklisted) {
            return interaction.reply({
                content: "❌ أنت في القائمة السوداء ولا يمكنك فتح تذكرة.",
                ephemeral: true
            });
        }
        
        const existingTicket = Object.values(db.tickets).find(ticket => ticket.ownerId === userId);
        if (existingTicket) {
            const existingChannel = interaction.guild.channels.cache.get(existingTicket.channelId);
            if (existingChannel) {
                return interaction.reply({
                    content: `❌ لديك تذكرة مفتوحة بالفعل في ${existingChannel}.`,
                    ephemeral: true
                });
            } else {
                delete db.tickets[existingTicket.channelId];
                writeDB(db);
            }
        }

        const categoryKey = interaction.values[0];
        const categoryData = TICKET_CATEGORIES[categoryKey];

        if (!categoryData) {
            return interaction.reply({ content: "❌ حدث خطأ في إعدادات القسم، يرجى إبلاغ الإدارة.", ephemeral: true });
        }
        
        const ticketNumber = (db.ticketCount || 0) + 1;

        const ticketChannel = await interaction.guild.channels.create({
            name: `${categoryData.emoji}-ticket-${ticketNumber}`,
            type: ChannelType.GuildText,
            parent: categoryData.parentCategoryId,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                { id: categoryData.roleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
            ]
        });

        db.tickets[ticketChannel.id] = {
            ownerId: userId,
            ticketNumber: ticketNumber,
            category: categoryKey,
            channelId: ticketChannel.id,
            openTimestamp: Date.now(),
            status: "open",
            claimedBy: null
        };
        db.ticketCount = ticketNumber;
        writeDB(db);

        const openEmbed = new EmbedBuilder()
            .setTitle(`${categoryData.emoji} ${categoryData.label}`)
            .setColor(0x0099ff)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`**[<@${userId}>] : مالك التذكرة**\n\n**[<@&${categoryData.roleId}>] : مشرفي التذاكر**\n\n**[<t:${Math.floor(Date.now() / 1000)}:f>] : تاريخ التذكرة**\n\n**[${ticketNumber}] : رقم التذكرة**\n\n**[${categoryData.label}] : قسم التذكرة**\n`)
            .setFooter({ text: "Your server Name0", iconURL: client.user.displayAvatarURL() });

        const claimButton = new ButtonBuilder()
            .setCustomId("claimTicket")
            .setLabel("استلام ✋")
            .setStyle(ButtonStyle.Success);
            
        const row = new ActionRowBuilder().addComponents(claimButton);

        await ticketChannel.send({ embeds: [openEmbed], components: [row] });
        await interaction.reply({ content: `✅ تم إنشاء تذكرتك بنجاح في ${ticketChannel}.`, ephemeral: true });
        
        const ticketStatusChannel = client.channels.cache.get(config.ticketStatusChannelId);
        if (ticketStatusChannel) {
            await ticketStatusChannel.send({
                embeds: [new EmbedBuilder().setDescription(`✅ تم فتح تذكرة جديدة باسم **${ticketChannel.name}** بواسطة <@${userId}>.`).setColor(0x0099ff)]
            });
        }

    } else if (interaction.isButton()) {
        // تحقق إذا كان الزر من نوع التقييم (في DM)
        if (interaction.customId.startsWith("rateTicket")) {
            const rating = interaction.customId.split('-')[1];
            const ticketOwnerId = interaction.customId.split('-')[2];

            const ratingEmbed = new EmbedBuilder()
                .setTitle("✅ تم تسجيل تقييمك")
                .setDescription(`شكراً لك على التقييم! لقد قمت بتقييم الدعم بـ ${rating} نجوم.`)
                .setColor(0x2ecc71);

            const ratingLogEmbed = new EmbedBuilder()
                .setTitle("⭐ تقييم جديد")
                .setDescription(`
                **مالك التذكرة:** <@${ticketOwnerId}>
                **المقيّم:** <@${interaction.user.id}>
                **التقييم:** ${rating} نجوم
                `)
                .setColor(0xffcc00);

            const ratingsLogChannel = client.channels.cache.get(config.ratingsLogChannelId);
            if (ratingsLogChannel) {
                await ratingsLogChannel.send({ embeds: [ratingLogEmbed] });
            }

            await interaction.update({ embeds: [ratingEmbed], components: [] });
        } 
        else {
            // هذا تفاعل في السيرفر، يمكننا استخدام interaction.member
            const ticketData = db.tickets[interaction.channel.id];
            if (!ticketData) return interaction.reply({ content: '❌ هذه ليست تذكرة صالحة.', ephemeral: true });
            
            const supportRole = interaction.guild.roles.cache.get(TICKET_CATEGORIES[ticketData.category]?.roleId || "0");
            if (!supportRole) return interaction.reply({ content: '❌ لم يتم العثور على دور الدعم.', ephemeral: true });

            const isSupport = interaction.member.roles.cache.has(supportRole.id);
            const isClaimedByMe = ticketData.claimedBy === interaction.user.id;
            
            if (interaction.customId === "claimTicket") {
                if (!isSupport) {
                    return interaction.reply({ content: '❌ ليس لديك صلاحية استلام التذاكر.', ephemeral: true });
                }
                if (ticketData.claimedBy) {
                    return interaction.reply({ content: `❌ هذه التذكرة تم استلامها بالفعل بواسطة <@${ticketData.claimedBy}>.`, ephemeral: true });
                }

                db.tickets[interaction.channel.id].claimedBy = interaction.user.id;
                writeDB(db);
                await interaction.channel.setName(`استلام-${interaction.channel.name}`);

                const newRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("renameTicket").setLabel("تغيير اسم 📝").setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId("addUserTicket").setLabel("إضافة شخص ➕").setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId("closeTicket").setLabel("إغلاق 🔒").setStyle(ButtonStyle.Danger)
                );
                
                // البحث عن الرسالة التي تحتوي على الأزرار وتعديلها
                const messages = await interaction.channel.messages.fetch({ limit: 10 });
                const mainMessage = messages.find(msg => msg.embeds.length > 0 && msg.embeds[0].footer?.text === "Your server Name0");
                if (mainMessage) {
                    await mainMessage.edit({ components: [newRow] });
                }

                await interaction.reply({
                    embeds: [new EmbedBuilder().setDescription(`✅ تم استلام التذكرة بواسطة <@${interaction.user.id}>.`).setColor(0x57f287)],
                    ephemeral: true
                });

            } else if (interaction.customId === "renameTicket") {
                if (!isClaimedByMe && !interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                    return interaction.reply({ content: '❌ لا يمكنك تغيير اسم هذه التذكرة.', ephemeral: true });
                }
                const modal = new ModalBuilder()
                    .setCustomId('renameModal')
                    .setTitle('تغيير اسم التذكرة');
                const nameInput = new TextInputBuilder()
                    .setCustomId('newNameInput')
                    .setLabel("الاسم الجديد للقناة")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);
                modal.addComponents(new ActionRowBuilder().addComponents(nameInput));
                await interaction.showModal(modal);
            
            } else if (interaction.customId === "addUserTicket") {
                if (!isClaimedByMe && !interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                    return interaction.reply({ content: '❌ لا يمكنك إضافة أعضاء لهذه التذكرة.', ephemeral: true });
                }
                const modal = new ModalBuilder()
                    .setCustomId('addUserModal')
                    .setTitle('إضافة عضو للتذكرة');
                const userInput = new TextInputBuilder()
                    .setCustomId('userMentionInput')
                    .setLabel("منشن العضو")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);
                modal.addComponents(new ActionRowBuilder().addComponents(userInput));
                await interaction.showModal(modal);
                
            } else if (interaction.customId === "closeTicket") {
                const ticketData = db.tickets[interaction.channel.id];
                if (!ticketData) {
                    return interaction.reply({ content: "❌ هذه ليست تذكرة نشطة.", ephemeral: true });
                }
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels) && ticketData.ownerId !== interaction.user.id) {
                    return interaction.reply({ content: "❌ ليس لديك الصلاحية لإغلاق هذه التذكرة.", ephemeral: true });
                }
                const modal = new ModalBuilder()
                    .setCustomId('closeModal')
                    .setTitle('أسباب إغلاق التذكرة');
                const reasonInput = new TextInputBuilder()
                    .setCustomId('reasonInput')
                    .setLabel("سبب الإغلاق")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);
                modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
                await interaction.showModal(modal);
            }
        }
    } else if (interaction.isModalSubmit()) {
        let db = readDB();

        if (interaction.customId === 'closeModal') {
            await interaction.deferReply({ ephemeral: true });

            const reason = interaction.fields.getTextInputValue('reasonInput');
            const ticketData = db.tickets[interaction.channel.id];
            if (!ticketData) {
                return interaction.editReply({ content: "❌ هذه ليست تذكرة نشطة." });
            }
            ticketData.status = 'closed';

            const owner = interaction.guild.members.cache.get(ticketData.ownerId);
            const openTimestamp = ticketData.openTimestamp;
            const closeTimestamp = Date.now();
            
            const closeLogEmbed = new EmbedBuilder()
                .setTitle("✅ تم إغلاق التذكرة")
                .setColor(0x00ff00)
                .setDescription(`
                **تم الفتح بواسطة:** <@${owner.id}>
                **تم المطالبة بواسطة:** ${ticketData.claimedBy ? `<@${ticketData.claimedBy}>` : 'لا أحد'}
                **تم الإغلاق بواسطة:** <@${interaction.user.id}>
                **وقت الفتح:** <t:${Math.floor(openTimestamp / 1000)}:f>
                **وقت الإغلاق:** <t:${Math.floor(closeTimestamp / 1000)}:f>
                **سبب الإغلاق:** ${reason}
                `);
            
            const transcriptFile = await createTranscript(interaction.channel, {
                limit: -1,
                fileName: `ticket-${ticketData.ticketNumber}.html`
            });

            const logChannel = client.channels.cache.get(TICKET_CATEGORIES[ticketData.category].logChannelId);
            if (logChannel) {
                await logChannel.send({ embeds: [closeLogEmbed], files: [transcriptFile] });
            }

            try {
                await owner.send({ embeds: [closeLogEmbed], files: [transcriptFile] });
                const ratingEmbed = new EmbedBuilder()
                    .setTitle("⭐ قيم تجربتك")
                    .setDescription("الرجاء تقييم تجربتك مع الدعم الفني بالضغط على أحد الأزرار أدناه.")
                    .setColor(0xffcc00);
                const ratingRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`rateTicket-1-${owner.id}`).setLabel('1 ⭐').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId(`rateTicket-2-${owner.id}`).setLabel('2 ⭐').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId(`rateTicket-3-${owner.id}`).setLabel('3 ⭐').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId(`rateTicket-4-${owner.id}`).setLabel('4 ⭐').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId(`rateTicket-5-${owner.id}`).setLabel('5 ⭐').setStyle(ButtonStyle.Primary)
                );
                await owner.send({ embeds: [ratingEmbed], components: [ratingRow] });
            } catch (e) {
                console.error(`Failed to DM user ${owner.id}:`, e);
            }
            
            const ticketStatusChannel = client.channels.cache.get(config.ticketStatusChannelId);
            if (ticketStatusChannel) {
                await ticketStatusChannel.send({
                    embeds: [new EmbedBuilder().setDescription(`🔒 التذكرة **${interaction.channel.name}** تم إغلاقها بواسطة <@${interaction.user.id}>.`).setColor(0xf04c3c)]
                });
            }

            await interaction.editReply({ content: '✅ تم إغلاق التذكرة بنجاح. سيتم حذف القناة قريباً.' });
            delete db.tickets[ticketData.channelId];
            writeDB(db);
            setTimeout(() => interaction.channel.delete(), 5000);

        } else if (interaction.customId === "renameModal") {
            const newName = interaction.fields.getTextInputValue('newNameInput');
            await interaction.channel.setName(newName);
            await interaction.reply({
                embeds: [new EmbedBuilder().setDescription(`✅ تم تغيير اسم التذكرة إلى \`${newName}\``).setColor(0x00ff00)],
                ephemeral: true
            });
        } else if (interaction.customId === "addUserModal") {
            const userMention = interaction.fields.getTextInputValue('userMentionInput');
            const userId = userMention.match(/\d+/)?.[0];
            const user = userId ? await interaction.guild.members.fetch(userId).catch(() => null) : null;
            if (!user) {
                return interaction.reply({ content: "❌ العضو المحدد غير صالح.", ephemeral: true });
            }
            await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: true, SendMessages: true });
            await interaction.reply({
                embeds: [new EmbedBuilder().setDescription(`✅ تمت إضافة ${user} إلى التذكرة.`).setColor(0x00ff00)],
                ephemeral: true
            });
        }
    }
});

client.login(process.env.BOT_TOKEN || config.token);