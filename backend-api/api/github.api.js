
let Octokit = require('@octokit/rest'),
  models = require('../db/models'),
  auth = require('../utils/auth.util'),
  bodyParser = require('body-parser'),
  config = require('config'),
  logger = require('tracer').colorConsole();

function listWebhooks(project){
  try{
    const octokit = new Octokit({
      auth: project.githubCredentials.token
    });

    return new Promise((res, rej) => {
      octokit.repos.listHooks({
        owner: project.githubDetails.owner,
        repo: project.githubDetails.repo
      }).then(({ error, data }) => {
        if(error) rej(error);
        res(data);
      });
    });

  }catch(err){
    logger.error("GITHUB API LIST WEBHOOKs:", 
      "error:", err);
    throw { code: 500, err };
  }
}

function deleteWebhook(project, webhook){
  try{
    const octokit = new Octokit({
      auth: project.githubCredentials.token
    });

    return new Promise((res, rej) => {
      octokit.repos.deleteHook({
        owner: project.githubDetails.owner,
        repo: project.githubDetails.repo,
        hook_id: webhook.id
      }).then(({ error, data }) => {
        if(error) rej(error);
        res(data);
      });
    });

  }catch(err){
    logger.error("GITHUB API CREATE WEBHOOK:", 
      "error:", err);
    throw { code: 500, err };
  }
}


function createWebhook(project){
  try{
    const octokit = new Octokit({
      auth: project.githubCredentials.token
    });

    return new Promise((res, rej) => {
      octokit.repos.createHook({
        owner: project.githubDetails.owner,
        repo: project.githubDetails.repo,
        config: {
          url: `${config.github.callback.url}/webhook/github/events/${project.id}`
        },
        events: ["push", "issues", "commit_comment", "pull_request_review", "pull_request_review_comment"]
      }).then(({ error, data }) => {
        if(error) rej(error);
        res(data);
      });
    });

  }catch(err){
    logger.error("GITHUB API CREATE WEBHOOK:", 
      "error:", err);
    throw { code: 500, err };
  }
}

function createBranch(project, ref, sha){
  try{
    const octokit = new Octokit({
      auth: project.githubCredentials.token
    });

    return new Promise((res, rej) => {
      octokit.git.createRef({
        owner: project.githubDetails.owner,
        repo: project.githubDetails.repo,
        ref,
        sha
      }).then(({ error, data }) => {
        if(error) rej(error);
        res(data);
      });
    });

  }catch(err){
    logger.error("GITHUB API CREATE BRANCH:", 
      "error:", err);
    throw { code: 500, err };
  }
}

function createPullRequest(project, title, head, base){
  try{
    const octokit = new Octokit({
      auth: project.githubCredentials.token
    });

    return new Promise((res, rej) => {
      octokit.pulls.create({
        owner: project.githubDetails.owner,
        repo: project.githubDetails.repo,
        title,
        head,
        base
      }).then(({ error, data }) => {
        if(error) rej(error);
        res(data);
      });
    });

  }catch(err){
    logger.error("GITHUB API CREATE PULL REQUEST:", 
      "error:", err);
    throw { code: 500, err };
  }
}

function createIssue(project, title, body){
  try{
    const octokit = new Octokit({
      auth: project.githubCredentials.token
    });

    return new Promise((res, rej) => {
      octokit.issues.create({
        owner: project.githubDetails.owner,
        repo: project.githubDetails.repo,
        title,
        body
      }).then(({ error, data }) => {
        if(error) rej(error);
        res(data);
      });
    });

  }catch(err){
    logger.error("GITHUB API CREATE ISSUE:", 
      "error:", err);
    throw { code: 500, err };
  }
}

function fetchOwner(project){
  try{
    const octokit = new Octokit({
      auth: project.githubCredentials.token
    });

    return new Promise((res, rej) => {
      octokit.users.getAuthenticated().then(({ error, data }) => {
        if(error) rej(error);
        res(data);
      });
    });
  }catch(err){
    logger.error("GITHUB API FETCH Owner:", 
      "error:", err);
    throw { code: 500, err };
  }
}

function fetchRepositories(project){
  try{
    const octokit = new Octokit({
      auth: project.githubCredentials.token
    });

    return new Promise((res, rej) => {
      octokit.repos.list().then(({ error, data }) => {
        if(error) rej(error);
        res(data);
      });
    });

  }catch(err){
    logger.error("GITHUB API FETCH COMMITS:", 
      "error:", err);
    throw { code: 500, err };
  }
}

function listCommits(project){
  try{
    const octokit = new Octokit({
      auth: project.githubCredentials.token
    });

    return new Promise((res, rej) => {
      octokit.repos.listCommits({
        owner: project.githubDetails.owner,
        repo: project.githubDetails.repo
      }).then(({ error, data }) => {
        if(error) rej(error);
        res(data);
      });
    });

  }catch(err){
    logger.error("GITHUB API FETCH COMMITS:", 
      "error:", err);
    throw { code: 500, err };
  }
}

function fetchCommit(project, commit){
  try{
    const octokit = new Octokit({
      auth: project.githubCredentials.token
    });

    return new Promise((res, rej) => {
      octokit.repos.getCommit({
        owner: project.githubDetails.owner,
        repo: project.githubDetails.repo,
        commit_sha: commit.sha
      }).then(({ error, data }) => {
        if(error) rej(error);
        res(data);
      });
    });

  }catch(err){
    logger.error("GITHUB API FETCH COMMITS:", 
      "error:", err);
    throw { code: 500, err };
  }
}

function fetchPullRequest(project, pr){
  try{
    const octokit = new Octokit({
      auth: project.githubCredentials.token
    });

    return new Promise((res, rej) => {
      octokit.pulls.get({
        owner: project.githubDetails.owner,
        repo: project.githubDetails.repo,
        pull_number: pr.number
      }).then(({ error, data }) => {
        if(error) rej(error);
        res(data);
      });
    });

  }catch(err){
    logger.error("GITHUB API FETCH PULL REQUESTS:", 
      "error:", err);
    throw { code: 500, err };
  }
}

function listPullRequests(project){
  try{
    const octokit = new Octokit({
      auth: project.githubCredentials.token
    });

    return new Promise((res, rej) => {
      octokit.pulls.list({
        owner: project.githubDetails.owner,
        repo: project.githubDetails.repo,
        state: "all"
      }).then(({ error, data }) => {
        if(error) rej(error);
        res(data);
      });
    });

  }catch(err){
    logger.error("GITHUB API FETCH PULL REQUESTS:", 
      "error:", err);
    throw { code: 500, err };
  }
}

function fetchIssues(){
  try{
    const octokit = new Octokit({
      auth: project.githubCredentials.token
    });

    return new Promise((res, rej) => {
      octokit.issues.listForRepo({
        owner: project.githubDetails.owner,
        repo: project.githubDetails.repo
      }).then(({ error, data }) => {
        if(error) rej(error);
        res(data);
      });
    });

  }catch(err){
    logger.error("GITHUB API FETCH ISSUES:", 
      "error:", err);
    throw { code: 500, err };
  }
}

function fetchBranches(project){
  try{
    const octokit = new Octokit({
      auth: project.githubCredentials.token
    });

    return new Promise((res, rej) => {
      octokit.git.listRefs({
        owner: project.githubDetails.owner,
        repo: project.githubDetails.repo
      }).then(({ error, data }) => {
        if(error) rej(error);
        res(data);
      });
    });
  }catch(err){
    logger.error("GITHUB API FETCH BRANCHES:", 
      "error:", err);
    throw { code: 500, err };
  }
}

function initEvents(app) {
  app.use("/webhook/github/events/:id", bodyParser.urlencoded({ extended: false }), async (req, res) => {
    
    const slack = require('./slack.api');
    const trello = require('./trello.api');
    
    const body = req.body;
    const params = req.params;

    if(body.payload){
      const project = await models.projects.findOne({
        where: { id: params.id }
      });
  
      project.trelloCredentials = JSON.parse(auth.decrypt(project.trelloCredentials));
      project.githubCredentials = JSON.parse(auth.decrypt(project.githubCredentials));
      project.slackCredentials = JSON.parse(auth.decrypt(project.slackCredentials));

      const payload = JSON.parse(body.payload);
      console.log(payload);

      /**
       * Pull request activity
       */
      if(payload.action === "submitted"){
        if(payload.review.state === "commented" && payload.slackCredentials){
          const message = slack.messageTemplate(`${payload.sender.login} has commented ` 
          + ` on your pull reuqest: ${payload.review.pull_request_url}.`);
          await slack.sendTemplate(project, message);
        }
        else if(payload.review.state === "changes_requested" && payload.slackCredentials){
          const message = slack.messageTemplate(`${payload.sender.login} has requested changes ` 
          + ` on your pull reuqest: ${payload.review.pull_request_url}.`);
          await slack.sendTemplate(project, message);
        }
        else if(payload.review.state === "approved" && payload.slackCredentials){
          const message = slack.messageTemplate(`${payload.sender.login} has approved ` 
          + ` on your pull reuqest: ${payload.review.pull_request_url}.`);
          await slack.sendTemplate(project, message);
        }

        return res.send();
      }

      /**
       * Commits into master
       */
      if(payload.ref === "refs/heads/master"){
        const lists = await trello.getListsOnBoard(project, project.trelloDetails);
      
        let doneList;
        for(let i = 0; i < lists.length; i += 1){
          if(lists[i].name === "Done")
            doneList = lists[i];
        }
      
        const cards = await trello.getCardsOnBoard(project, project.trelloDetails);
      
        let card;
        for(let i = 0; i < cards.length; i += 1){
          const name = payload.head_commit.message.split("\n\nMerge ")[1];
          if(cards[i].name === name)
            card = cards[i];
        }
      
        await trello.updateCardList(project, doneList, card);

        return res.send();
      }

      /**
       * General commits
       */
      if(payload.ref){
        const lists = await trello.getListsOnBoard(project, project.trelloDetails);
      
        let doingList;
        for(let i = 0; i < lists.length; i += 1){
          if(lists[i].name === "Doing")
            doingList = lists[i];
        }

        const cards = await trello.getCardsOnBoard(project, project.trelloDetails);

        let card;
        for(let i = 0; i < cards.length; i += 1){
          const name = payload.ref.split("/")[2];
          if(cards[i].name === name)
            card = cards[i];
        }

        await trello.updateCardList(project, doingList, card);

        await trello.addCommentToCard(project, card, 
          `New commit ${payload.head_commit.id} (${payload.head_commit.url}), message: ${payload.head_commit.message}, `
             + `by: ${payload.head_commit.author.name}`);

        return res.send();
      }
    }

    return res.send();
  });
}

module.exports = {
  listWebhooks,
  deleteWebhook,
  createWebhook,
  createPullRequest,
  createIssue,
  createBranch,
  fetchOwner,
  fetchRepositories,
  fetchCommit,
  listCommits,
  fetchPullRequest,
  listPullRequests,
  fetchIssues,
  fetchBranches,
  initEvents
}