const logger = require("tracer").colorConsole();
const trello = require("../api/trello.api");
const github = require("../api/github.api");
const auth = require("../utils/auth.util");
const models = require("../db/models");

async function createProject(req, res) {
  try {
    const user = await models.users.findOne({
      where: { id: req.user.id }
    });
    const project = await models.projects.create({
      owner: user.id,
      ...req.body
    });

    const { projects } = user;
    projects.push(project.id);
    await user.update({
      projects
    });

    return res.json(project);
  } catch (err) {
    logger.error("ERROR CREATE PROJECT");
    return res.status(err.code || 500).json({
      error: err.message || err
    });
  }
}

async function addTrelloCredentials(req, res) {
  try {
    const user = await models.users.findOne({
      where: { id: req.user.id }
    });
    const project = await models.projects.findOne({
      where: { id: req.params.id }
    });
    await project.update({
      trelloCredentials: auth.encrypt(JSON.stringify(req.body))
    });

    project.trelloCredentials = JSON.parse(
      auth.decrypt(project.trelloCredentials)
    );

    const member = await trello.getMember(project, user.email);
    const boards = await trello.getBoards(project, member);

    return res.json(boards);
  } catch (err) {
    logger.error("ERROR ADD TRELLO CREDENTIALS");
    return res.status(err.code || 500).json({
      error: err.message || err
    });
  }
}

async function addTrelloDetails(req, res) {
  try {
    await models.projects.update(
      {
        trelloDetails: req.body
      },
      { where: { id: req.params.id } }
    );

    return res.send();
  } catch (err) {
    logger.error("ERROR ADD TRELLO DETAILS");
    return res.status(err.code || 500).json({
      error: err.message || err
    });
  }
}

async function addGithubCredentials(req, res) {
  try {
    const project = await models.projects.findOne({
      where: { id: req.params.id }
    });
    await project.update({
      githubCredentials: auth.encrypt(JSON.stringify(req.body))
    });

    project.githubCredentials = JSON.parse(
      auth.decrypt(project.githubCredentials)
    );

    const repos = await github.fetchRepositories(project);

    return res.json(repos);
  } catch (err) {
    logger.error("ERROR ADD GITHUB CREDENTIALS");
    return res.status(err.code || 500).json({
      error: err.message || err
    });
  }
}

async function addGithubDetails(req, res) {
  try {
    const project = await models.projects.findOne({
      where: { id: req.params.id }
    });
    await project.update({
      githubDetails: req.body
    });

    project.trelloCredentials = JSON.parse(
      auth.decrypt(project.trelloCredentials)
    );
    project.githubCredentials = JSON.parse(
      auth.decrypt(project.githubCredentials)
    );

    const webhooks = await github.listWebhooks(project);
    for (let i = 0; i < webhooks.length; i += 1) {
      await github.deleteWebhook(project, webhooks[i]);
    }

    await github.createWebhook(project);

    return res.send();
  } catch (err) {
    logger.error("ERROR ADD GITHUB DETAILS");
    return res.status(err.code || 500).json({
      error: err.message || err
    });
  }
}

async function initBasicGitFlowBoard(req, res) {
  try {
    const project = await models.projects.findOne({
      where: { id: req.params.id }
    });
    project.trelloCredentials = JSON.parse(
      auth.decrypt(project.trelloCredentials)
    );
    project.githubCredentials = JSON.parse(
      auth.decrypt(project.githubCredentials)
    );

    const board = await trello.addBoard(project, {
      name: project.name,
      description: project.description
    });
    const lists = await trello.getListsOnBoard(project, board);
    for (let i = 0; i < lists.length; i += 1) {
      await trello.archiveList(project, lists[i]);
    }

    // initialise trello board...
    await project.update({
      trelloDetails: { id: board.id }
    });

    await trello.addListToBoard(project, board, {
      name: "Done"
    });
    await trello.addListToBoard(project, board, {
      name: "Code review"
    });
    await trello.addListToBoard(project, board, {
      name: "Doing"
    });
    await trello.addListToBoard(project, board, {
      name: "To do"
    });
    await trello.addListToBoard(project, board, {
      name: "Issues"
    });
    await trello.addListToBoard(project, board, {
      name: "Backlog"
    });

    const response = await trello.addWebhook(project, board);

    logger.debug(response);

    return res.send();
  } catch (err) {
    logger.error("ERROR INIT BASIC GIT FLOW BOARD");
    return res.status(err.code || 500).json({
      error: err.message || err
    });
  }
}

module.exports = {
  createProject,
  addTrelloCredentials,
  addTrelloDetails,
  addGithubCredentials,
  addGithubDetails,
  initBasicGitFlowBoard
};
