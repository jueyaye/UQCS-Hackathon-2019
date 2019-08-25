let { WebClient } = require('@slack/web-api'),
  trello = require('./trello.api'),
  github = require('./github.api'),
  auth = require('../utils/auth.util'),
  models = require('../db/models'),
  bodyParser = require('body-parser'),
  rp = require('request-promise'),
  config = require('config'),
  logger = require('tracer').colorConsole(); 

function expandOptions(options){
  let blockList = []
  for(var i = 0; i < options.length; i += 1){
    blockList.push({
      "text": {
        "type": "plain_text",
        "text": options[i].title,
        "emoji": true
      },
      "value": options[i].value
    });
  }

  return blockList;
}
function searchTemplate(name, options){
  return [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `Select ${name}`
      },
      "accessory": {
        "type": "static_select",
        "placeholder": {
          "type": "plain_text",
          "text": `Select ${name}`,
          "emoji": true
        },
        "options": expandOptions(options)
      }
    }
  ];
}

function dateTemplate(){
  return [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Pick a date for the deadline."
      },
      "accessory": {
        "type": "datepicker",
        "initial_date": "2019-07-25",
        "placeholder": {
          "type": "plain_text",
          "text": "Select a date",
          "emoji": true
        }
      }
    }
  ];
}

function expandList(list){
  let blocks = []
  for(var i = 0; i < list.length; i += 1){
    blockList.push({
      "type": "plain_text",
      "text": `*${list[i]}*`,
      "emoji": true
    });
  }
  return blocks;

}
function listTemplate(name, list, author){
  return [
    {
      "type": "section",
      "text": {
        "type": "plain_text",
        "text": name,
        "emoji": true
      }
    },
    {
      "type": "section",
      "fields": expandList(list)
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": `*Author:* ${author}`
        }
      ]
    }
  ]
}

function messageTemplate(message){
  return [
    {
      "type": "section",
      "text": {
        "type": "plain_text",
        "text": message,
        "emoji": true
      }
    }
  ];
}

function makeFilePublic(file){
  try{
    const options = {
      uri: `https://slack.com/api/files.sharedPublicURL?token=${config.slack.token}&file=${file.id}&pretty=1`,
      method: 'GET',
    }
    return rp(options);

  } catch(err) {
    logger.error(err);
    throw new Error('Error making file public.');
  }
}

function sendTemplate(project, blocks){
  try{
    const slack = new WebClient(config.slack.token);

    return new Promise((res, rej) => {
      slack.chat.postMessage({
        channel: project.slackDetails.channelId,
        blocks
      })
    });

  }catch(err){
    logger.error("SLACK API SEND MESSAGE:", 
      "error:", err);
    throw { code: 500, err };
  } 
}

function initActions(app){
  app.use("/webhook/slack/actions", bodyParser.urlencoded({ extended: false }), async (req, res) => {
    try{
      const body = req.body;

      if(body.payload){
        const payload = JSON.parse(body.payload);
        const project = await models.projects.findOne({
          where: { 
            slackDetails: {
              teamId: payload.team.id,
              channelId: payload.channel.id,
              channelName: payload.channel.name
            } 
          }
        });
    
        project.trelloCredentials = JSON.parse(auth.decrypt(project.trelloCredentials));
        project.githubCredentials = JSON.parse(auth.decrypt(project.githubCredentials));
        project.slackCredentials = JSON.parse(auth.decrypt(project.slackCredentials));

        if(payload.type === 'message_action'){
          const message = payload.message;

          console.log(message);

          const cards = await trello.getCardsOnBoard(project, project.trelloDetails);
          res.send();

          let card;
          for(let i = 0; i < cards.length; i += 1)
            if(cards[i].name === "step1") 
              card = cards[i]; 

          if(message.files){
            const file = message.files[0];
            let publicFile = await makeFilePublic(file);

            if(JSON.parse(publicFile).error === "already_public")
              publicFile = file;
              
            return await trello.addAttachmentToCard(project, card, publicFile.permalink_public);
          }

          if(message.blocks){
            const text = message.blocks[0];

            return await trello.addCommentToCard(project, card, text.text.text);
          }

          return await trello.addCommentToCard(project, card, message.text);
        }

        const action = payload.actions[0];
        if(action.type === 'static_select'){
          const selected = JSON.parse(action.selected_option.value);

          if(selected.element === "card"){
            const card = await trello.getCard(project, project.trelloDetails, { id: selected.id });

            res.send();
            return await sendTemplate(project, messageTemplate(`${card.shortUrl}`));
          }
          if(selected.element === "commit"){
            const commit = await github.fetchCommit(project, { sha: selected.id });

            res.send();
            return await sendTemplate(project, messageTemplate(`${commit.url}`));
          }
          if(selected.element === "pull-request"){
            const pr = await github.fetchPullRequest(project, { number: selected.id });

            res.send();
            return await sendTemplate(project, messageTemplate(`${pr.url}`));
          }
        }
      }

      return res.send();

    } catch(err) {
      logger.error(err);
      return res.status(400).send();
    }
  });
}

function initCommands(app){
  app.use("/webhook/slack/commands", bodyParser.urlencoded({ extended: false }), async (req, res) => {
    try{
      const body = req.body;
      console.log(body);
  
      if(body.command === "/link"){
        const project = await models.projects.findOne({
          where: { id: body.text }
        });
        if(!project)
          throw new Errror('No project id found matching supplied id.');

        await project.update({
          slackDetails: { 
            teamId: body.team_id,
            channelId: body.channel_id,
            channelName: body.channel_name
          },
          slackCredentials: auth.encrypt(JSON.stringify({ token: body.token }))
        });
  
        return res.send();
      }

      if(body.command === "/tag"){
        res.send();

        const project = await models.projects.findOne({
          where: { 
            slackDetails: {
              teamId: body.team_id,
              channelId: body.channel_id,
              channelName: body.channel_name
            } 
          }
        });
    
        project.trelloCredentials = JSON.parse(auth.decrypt(project.trelloCredentials));
        project.githubCredentials = JSON.parse(auth.decrypt(project.githubCredentials));
        project.slackCredentials = JSON.parse(auth.decrypt(project.slackCredentials));

        const args = body.text.split(" ");
        const element = args[0];

        if(element === 'card'){
          const cards = await trello.getCardsOnBoard(project, project.trelloDetails);

          let cardsParsed = [];
          for(let i = 0; i < cards.length; i += 1){
            cardsParsed.push({ 
              title: cards[i].name,
              value: JSON.stringify({ element: "card", id: cards[i].id })
            });
          }

          return await sendTemplate(project, searchTemplate("cards", cardsParsed));
        }

        if(element === 'commit'){
          const commits = await github.listCommits(project);

          let commitsParsed = [];
          for(let i = 0; i < commits.length; i += 1){
            commitsParsed.push({ 
              title: `${commits[i].sha.substring(0, 7)}...`,
              value: JSON.stringify({ element: "commit", id: commits[i].sha })
            });
          }

          return await sendTemplate(project, searchTemplate("commits", commitsParsed));
        }

        if(element === 'pull-request'){
          const pulls = await github.listPullRequests(project);

          let pullsParsed = [];
          for(let i = 0; i < pulls.length; i += 1){
            pullsParsed.push({ 
              title: `${pulls[i].title} (${pulls[i].state})`,
              value: JSON.stringify({ element: "pull-request", id: pulls[i].number })
            });
          }

          return await sendTemplate(project, searchTemplate("pull requests", pullsParsed));
        }

        return res.status(400).send();
      }      
  
      return res.status(400).send(); 

    } catch(err) {
      logger.error(err);
      return res.status(400).send();
    }
  });
}

module.exports = {
  searchTemplate,
  dateTemplate,
  listTemplate,
  makeFilePublic,
  messageTemplate,
  sendTemplate,
  initActions,
  initCommands,
}