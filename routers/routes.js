const express = require("express");
const controller = require("../controllers/controller");
const verifyToken = require("../middlewares/auth");

const postRouter = express.Router();

postRouter.get('/test', controller.test);
postRouter.post('/addUser', controller.addUser);
postRouter.post('/authenticate', controller.authenticate);
postRouter.post('/follow/:following', verifyToken, controller.follow);
postRouter.post('/unfollow/:following', verifyToken, controller.unfollow);
postRouter.get('/user', verifyToken, controller.getUser);
postRouter.post('/posts', verifyToken, controller.createPost);
postRouter.delete('/posts/:id', verifyToken, controller.deletePost);
postRouter.post('/like/:id', verifyToken, controller.likePost);
postRouter.post('/unlike/:id', verifyToken, controller.unlikePost);
postRouter.post('/comment/:id', verifyToken, controller.addComment);
postRouter.get('/posts/:id', verifyToken, controller.getPost);
postRouter.get('/all_posts', verifyToken, controller.getAllPosts);

module.exports = postRouter;