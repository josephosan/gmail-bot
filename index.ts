import { bot } from "./bot";
import { authorize, listLabels } from "./gmail";

// * Run gmail stuff
authorize().then(listLabels).catch(console.error);

// * Launch bot
bot.launch()