const config = require("config");
const logger = require("tracer").colorConsole();
const Trello = require("trello");
const bodyParser = require("body-parser");
const github = require("./github.api");
const auth = require("../utils/auth.util");
const models = require("../db/models");

function search(project, query) {
  const trello = new Trello(
    project.trelloCredentials.key,
    project.trelloCredentials.token
  );
  return new Promise((resolve, reject) => {
    trello.makeRequest("GET", "/1/search", { query }, (error, data) => {
      if (error) reject(error);

      resolve(data);
    });
  });
}

function deleteWebhook(project, id) {
  const trello = new Trello(
    project.trelloCredentials.key,
    project.trelloCredentials.token
  );
  return new Promise((resolve, reject) => {
    trello.deleteWebhook(id, (error, data) => {
      if (error) reject(error);

      resolve(data);
    });
  });
}

function addWebhook(project, board) {
  const trello = new Trello(
    project.trelloCredentials.key,
    project.trelloCredentials.token
  );
  return new Promise((resolve, reject) => {
    trello.addWebhook(
      project.id,
      `${config.trello.callback.url}/webhook/trello/events/${project.id}`,
      board.id,
      (error, data) => {
        if (error) reject(error);

        resolve(data);
      }
    );
  });
}

function addCard(project, list, card) {
  const trello = new Trello(
    project.trelloCredentials.key,
    project.trelloCredentials.token
  );
  return new Promise((resolve, reject) => {
    trello.addCard(card.name, card.description, list.id, (error, data) => {
      if (error) reject(error);

      resolve(data);
    });
  });
}

function addCommentToCard(project, card, comment) {
  const trello = new Trello(
    project.trelloCredentials.key,
    project.trelloCredentials.token
  );
  return new Promise((resolve, reject) => {
    trello.addCommentToCard(card.id, comment, (error, data) => {
      if (error) reject(error);

      resolve(data);
    });
  });
}

function addDueDateToCard(project, card, date) {
  const trello = new Trello(
    project.trelloCredentials.key,
    project.trelloCredentials.token
  );
  return new Promise((resolve, reject) => {
    trello.addDueDateToCard(card.id, date, (error, data) => {
      if (error) reject(error);

      resolve(data);
    });
  });
}

function addAttachmentToCard(project, card, attachmentUrl) {
  const trello = new Trello(
    project.trelloCredentials.key,
    project.trelloCredentials.token
  );
  return new Promise((resolve, reject) => {
    trello.addAttachmentToCard(card.id, attachmentUrl, (error, data) => {
      if (error) reject(error);

      resolve(data);
    });
  });
}

function addMemderToCard(project, card, member) {
  const trello = new Trello(
    project.trelloCredentials.key,
    project.trelloCredentials.token
  );
  return new Promise((resolve, reject) => {
    trello.addMemberToCard(card.id, member.id, (error, data) => {
      if (error) reject(error);

      resolve(data);
    });
  });
}

function addLabelToCard(project, card, label) {
  const trello = new Trello(
    project.trelloCredentials.key,
    project.trelloCredentials.token
  );
  return new Promise((resolve, reject) => {
    trello.addLabelToCard(card.id, label.id, (error, data) => {
      if (error) reject(error);

      resolve(data);
    });
  });
}

function addBoard(project, board) {
  const trello = new Trello(
    project.trelloCredentials.key,
    project.trelloCredentials.token
  );
  return new Promise((resolve, reject) => {
    trello.addBoard(board.name, board.description, null, (error, data) => {
      if (error) reject(error);

      resolve(data);
    });
  });
}

function addListToBoard(project, board, list) {
  const trello = new Trello(
    project.trelloCredentials.key,
    project.trelloCredentials.token
  );
  return new Promise((resolve, reject) => {
    trello.addListToBoard(board.id, list.name, (error, data) => {
      if (error) reject(error);

      resolve(data);
    });
  });
}

function addMemberToBoard(project, board, member) {
  const trello = new Trello(
    project.trelloCredentials.key,
    project.trelloCredentials.token
  );
  return new Promise((resolve, reject) => {
    trello.addMemberToBoard(board.id, member.id, member.type, (error, data) => {
      if (error) reject(error);

      resolve(data);
    });
  });
}

function getCard(project, board, card) {
  const trello = new Trello(
    project.trelloCredentials.key,
    project.trelloCredentials.token
  );
  return new Promise((resolve, reject) => {
    trello.getCard(board.id, card.id, (error, data) => {
      if (error) reject(error);

      resolve(data);
    });
  });
}

function getCardsOnList(project, list) {
  const trello = new Trello(
    project.trelloCredentials.key,
    project.trelloCredentials.token
  );
  return new Promise((resolve, reject) => {
    trello.getCardsOnList(list.id, (error, data) => {
      if (error) reject(error);

      resolve(data);
    });
  });
}

function getCardsOnBoard(project, board) {
  const trello = new Trello(
    project.trelloCredentials.key,
    project.trelloCredentials.token
  );
  return new Promise((resolve, reject) => {
    trello.getCardsOnBoard(board.id, (error, data) => {
      if (error) reject(error);

      resolve(data);
    });
  });
}

function getListsOnBoard(project, board) {
  const trello = new Trello(
    project.trelloCredentials.key,
    project.trelloCredentials.token
  );
  return new Promise((resolve, reject) => {
    trello.getListsOnBoard(board.id, (error, data) => {
      if (error) reject(error);

      resolve(data);
    });
  });
}

function getBoards(project, member) {
  const trello = new Trello(
    project.trelloCredentials.key,
    project.trelloCredentials.token
  );
  return new Promise((resolve, reject) => {
    trello.getBoards(member.id, (error, data) => {
      if (error) reject(error);

      resolve(data);
    });
  });
}

function getMember(project, email) {
  const trello = new Trello(
    project.trelloCredentials.key,
    project.trelloCredentials.token
  );
  return new Promise((resolve, reject) => {
    trello.makeRequest("GET", `/1/members/${email}`, null, (error, data) => {
      if (error) reject(error);

      resolve(data);
    });
  });
}

function updateCardList(project, list, card) {
  const trello = new Trello(
    project.trelloCredentials.key,
    project.trelloCredentials.token
  );
  return new Promise((resolve, reject) => {
    trello.updateCardList(card.id, list.id, (error, data) => {
      if (error) reject(error);

      resolve(data);
    });
  });
}

function archiveList(project, list) {
  const trello = new Trello(
    project.trelloCredentials.key,
    project.trelloCredentials.token
  );
  return new Promise((resolve, reject) => {
    trello.makeRequest(
      "PUT",
      `/1/lists/${list.id}/closed`,
      { value: true },
      (error, data) => {
        if (error) reject(error);

        resolve(data);
      }
    );
  });
}

function initEvents(app) {
  app.use("/webhook/trello/events/:id", bodyParser.json(), async (req, res) => {
    const { body } = req;
    const { params } = req;

    if (!body.action) return res.send();

    const project = await models.projects.findOne({
      where: { id: params.id }
    });

    project.trelloCredentials = JSON.parse(
      auth.decrypt(project.trelloCredentials)
    );
    project.githubCredentials = JSON.parse(
      auth.decrypt(project.githubCredentials)
    );

    if (body.action.type === "updateCard") {
      logger.debug(body);
      const list = body.action.data.listAfter;

      if (list.name === "Doing") {
        const branches = await github.fetchBranches(project);
        let master;
        for (let i = 0; i < branches.length; i += 1) {
          if (branches[i].ref === "refs/heads/master") master = branches[i];
        }

        await github.createBranch(
          project,
          `refs/heads/${body.action.data.card.name}`,
          master.object.sha
        );
      }

      if (list.name === "Code review") {
        logger.debug(body.action.data.card.name);

        await github.createPullRequest(
          project,
          `Merge ${body.action.data.card.name}`,
          `refs/heads/${body.action.data.card.name}`,
          "refs/heads/master"
        );
      }
    }

    return res.send();
  });
}

module.exports = {
  search,
  deleteWebhook,
  addWebhook,
  addCard,
  addCommentToCard,
  addDueDateToCard,
  addAttachmentToCard,
  addMemderToCard,
  addLabelToCard,
  addBoard,
  addListToBoard,
  addMemberToBoard,
  getCard,
  getCardsOnList,
  getCardsOnBoard,
  getListsOnBoard,
  getBoards,
  getMember,
  updateCardList,
  archiveList,
  initEvents
};
