
let router = require('express').Router();

const {
  celebrate,
  Joi
} = require('celebrate');

const project = require('../controllers/project.controller');

router.post('/create',  celebrate({
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string(),
    members: Joi.array().items(Joi.string())
  })
}), project.createProject);

router.post('/:id/trello/credentials',  celebrate({
  body: Joi.object().keys({
    token: Joi.string().required(),
    key: Joi.string().required()
  })
}), project.addTrelloCredentials);

router.post('/:id/trello/details',  celebrate({
  body: Joi.object().keys({
    board: Joi.string().required()
  })
}), project.addTrelloDetails);

router.post('/:id/github/credentials',  celebrate({
  body: Joi.object().keys({
    token: Joi.string().required()
  })
}), project.addGithubCredentials);

router.post('/:id/github/details',  celebrate({
  body: Joi.object().keys({
    repo: Joi.string().required(),
    owner: Joi.string().required()
  })
}), project.addGithubDetails);

router.post('/:id/init/basic-git-flow',  celebrate({
  body: Joi.object().keys({})
}), project.initBasicGitFlowBoard);

module.exports = router;