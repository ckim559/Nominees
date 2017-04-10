"use strict";

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

"use strict";

let nforce = require('nforce'),

    SF_CLIENT_ID = process.env.SF_CLIENT_ID,
    SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET,
    SF_USER_NAME = process.env.SF_USER_NAME,
    SF_PASSWORD = process.env.SF_PASSWORD,
 
org = nforce.createConnection({
	environment: 'sandbox',
        clientId: SF_CLIENT_ID,
        clientSecret: SF_CLIENT_SECRET,
        redirectUri: 'http://localhost:3000/oauth/_callback',
        mode: 'single',
        autoRefresh: true
    });
	
	
let login = () => {

    org.authenticate({username: SF_USER_NAME, password: SF_PASSWORD}, err => {
        if (err) {
            console.error("Authentication error");
            console.error(err);
        } else {
            console.log("Authentication successful");
        }
    });

};


login();

let Botkit = require('botkit'),
    formatter = require('./modules/slack-formatter'),
    salesforce = require('./modules/salesforce'),
	moment = require('moment'),
	
    controller = Botkit.slackbot(),

    bot = controller.spawn({
    token: SLACK_BOT_TOKEN
    });

bot.startRTM(err => {
    if (err) {
        throw new Error('Could not connect to Slack');
    }
});


controller.hears(['(.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    
	let shouts
	
	let q = "SELECT ID FROM Services_Shoutout__c WHERE Shoutout_Week__r.Open_Voting__c = TRUE LIMIT 1";

			org.query({ query: q }, function(err, resp){
			let ac2 = resp.records[0];
	
	if(ac2 == null)
	{
		var d = new Date();
		var n = d.getDay();
		
		if(n == 0 || n == 1 || n == 2 || n == 6)
		
		{	
		
			bot.reply(message, "*Voting has not opened yet, please try again on Wednesday!*");
		
		}
		
		else{
	    
			bot.reply(message, "*No shoutouts were submitted last week!* ");
		
		}
	}
	else{
		
    salesforce.findshoutouts(shouts)
        .then(shoutouts => bot.reply(message, {
            attachments: formatter.formatShoutouts(shoutouts)
        }))
        .catch(error => bot.reply(message, error));
	
	bot.reply(message, "*Here are last week's shoutouts: *");
	
	}
	});
        
  });
