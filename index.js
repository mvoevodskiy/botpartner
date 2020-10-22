const YAML = require('js-yaml');
const fs = require('fs');
const file = fs.readFileSync('./bot.yml', 'utf8');
const schema = YAML.safeLoad(file);
const { SessionStorage } = require('@vbots/session-storage');

const BotCMS = require('botcms');
require('dotenv').config();

['log', 'warn', 'error'].forEach(a => {
    let b = console[a];
    console[a] = (...c) => {
        try {
            throw new Error
        } catch (d) {
            b.apply(console, [d.stack.split('\n')[2].trim().substring(3).replace(__dirname, '').replace(/\s\(./, ' at ').replace(/\)/, ''), '\n', ...c])
        }
    }
});

let bot = null;

Promise.resolve()
    .then(async () => {
        let storage = new SessionStorage({name: 'vkontakte_db.json'});
        await storage.init();

        bot = await new BotCMS({
            networks: [
                {
                    name: 'tg',
                    token: process.env.TG_TOKEN,
                    payment_token: process.env.TG_PAYMENT_TOKEN
                },
                {
                    name: 'vk_bp',
                    token: process.env.VK_TOKEN_BP,
                    pollingGroupId: 93306505,
                    driver: "vk",
                    sessionParams: {
                        storage,
                        getStorageKey: context => (String(context.peerId) + ':' + String(context.senderId)),
                    },
                },
            ]
        });
        return bot;
    })
    .then(() => bot.loadSchema(schema))
    .then(() => bot.init())
    .then(() => bot.launch());
