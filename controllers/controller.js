const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/user.js');
const Post = require('../models/post.js');
const Comment = require('../models/comment.js');

dotenv.config();

const test = async (req, res) => {
    return res.status(200).json({
        message: 'Hello World'
    });
}

const addUser = async (req, res) => {
    const {name, email, password} = req.body;
    const hash = crypto.createHash('sha256').update(password).digest('hex');

    try {
        const user = await User.create({
            name: name,
            email: email,
            password: hash
        });
        // await user.save();

        return res.status(200).json({
            message: 'User added successfully',
            status: true,
            user: user
        });
    } catch (err) {
        if (err.code === 11000) {
            console.log(err.message);
            return res.status(409).json({
                message: 'User already exists',
                status: false
            });
        }
        console.log(err);
        return res.status(500).json({
            message: 'Error adding user',
            error: err
        });
    }
}

const authenticate = async (req, res) => {
    const {email, password} = req.body;
    try {
        let user = await User.findOne({email: email});
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        const hash = crypto.createHash('sha256').update(password).digest('hex');
        if (hash !== user.password) {
            return res.status(401).json({
                message: 'Wrong password'
            });
        }
        return jwt.sign({
            email: user.email,
            username: user.username,
            id: user._id
        }, process.env.TOKEN_SECRET, {expiresIn: '1800s'}, async (err, token) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: 'Error generating token',
                    error: err
                });
            }
            return res.header({token: token}).status(200).json({
                status: true,
                message: 'User authenticated',
                token: token
            });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Unknown error',
            error: error
        });
    }
}

const follow = async (req, res) => {
    const user = req.user.email;
    const followingId = req.params?.following;

    try {
        const followingProfile = await User.findOne({email: user});// user who is following
        const followerProfile = await User.findById(followingId); // user who is being followed
        if (!followingProfile || !followerProfile) {
            return res.status(404).json({
                status: false,
                message: 'User not found'
            });
        }

        const followers = new Set(followerProfile.followers || []);
        const following = new Set(followingProfile.following || []);
        followers.add(followingProfile._id);
        following.add(followerProfile._id);
        followerProfile.followers = [...followers];
        followingProfile.following = [...following];
        await followingProfile.save();
        await followerProfile.save();
        return res.status(200).json({
            status: true,
            message: 'User followed successfully'
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status: false,
            message: 'Error following user',
            error: err
        });
    }
}

const unfollow = async (req, res) => {
    const user = req.user.email;
    const followingId = req.params?.following;

    try {
        const followingProfile = await User.findOne({email: user});// user who is following
        const followerProfile = await User.findById(followingId); // user who is being followed
        if (!followingProfile || !followerProfile) {
            return res.status(404).json({
                status: false,
                message: 'User not found'
            });
        }

        const following = followingProfile.following || [];
        following.map((id, index) => {
            if (id.toString() === followingId) {
                following.splice(index, 1);
            }
        });

        const followers = followerProfile.followers || [];
        console.log(followers);
        followers.map((id, index) => {
            if (id.toString() === followingProfile._id.toString()) {
                followers.splice(index, 1);
            }
        });

        followerProfile.followers = followers;
        followingProfile.following = following;
        await followingProfile.save();
        await followerProfile.save();

        return res.status(200).json({
            status: true,
            message: 'User unfollowed successfully'
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status: false,
            message: 'Error following user',
            error: err
        });

    }
}

const getUser = async (req, res) => {
    try {
        const user = await User.findOne({email: req.user.email}).populate('following').populate('followers').lean();
        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'User not found'
            });
        }
        delete user.password;
        user.followerCount = user.followers.length;
        return res.status(200).json({
            status: true,
            message: 'User found',
            user: user
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Error getting user',
            error: err
        });
    }
}

const createPost = async (req, res) => {
    const {title, description} = req.body;
    const user = req.user;
    try {
        const post = await Post.create({
            title: title,
            createdBy: user.id,
            description: description
        });
        delete post._id;
        delete post.createdBy;
        delete post.__v;
        return res.status(200).json({
            status: true,
            message: 'Post created successfully',
            post: post
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Error adding post',
            error: err
        });
    }
}

const deletePost = async (req, res) => {
    const {id} = req.params;
    const user = req.user;
    try {
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({
                status: false,
                message: 'Post not found'
            });
        }
        if (post.createdBy.toString() !== user.id) {
            return res.status(401).json({
                status: false,
                message: 'Unauthorized'
            });
        }
        await Post.deleteOne({_id: id});
        return res.status(200).json({
            status: true,
            message: 'Post deleted successfully'
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Error deleting post',
            error: err
        });
    }
}

const likePost = async (req, res) => {
    const {id} = req.params;
    const user = req.user;

    try {
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({
                status: false,
                message: 'Post not found'
            });
        }
        const likes = new Set(post.likes || []);
        likes.add(user.id);
        post.likes = [...likes];
        await post.save();
        return res.status(200).json({
            status: true,
            message: 'Post liked successfully'
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Error liking post',
            error: err
        });
    }
}

const unlikePost = async (req, res) => {
    const {id} = req.params;

    try {
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({
                status: false,
                message: 'Post not found'
            });
        }
        const likes = post.likes || [];
        likes.map((id, index) => {
            if (id.toString() === req.user.id) {
                likes.splice(index, 1);
            }
        });
        post.likes = likes;
        await post.save();

        return res.status(200).json({
            status: true,
            message: 'Post unliked successfully'
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Error unliking post',
            error: err
        });
    }
}

const addComment = async (req, res) => {
    const {id} = req.params;
    const text = req.body.comment;
    const userid = req.user.id;

    console.log(text);
    try {
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({
                status: false,
                message: 'Post not found'
            });
        }
        const comment = await Comment.create({
            text: text,
            post: id,
            createdBy: userid
        });
        post.comments.push(comment._id);
        await post.save();
        return res.status(200).json({
            status: true,
            message: 'Comment added successfully',
            commentId: comment._id
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Error adding comment',
            error: err
        });
    }
}

const getPost = async (req, res) => {
    const {id} = req.params;
    try {
        const post = await Post.findById(id).populate('comments').lean();
        if (!post) {
            return res.status(404).json({
                status: false,
                message: 'Post not found'
            });
        }
        post.likesCount = post.likes.length;
        return res.status(200).json({
            status: true,
            message: 'Post found',
            post: post
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Error fetching post',
            error: err
        });
    }
}

const getAllPosts = async (req, res) => {
    const user = req.user.id;
    try {
        const posts = await Post.find({createdBy: user}).populate('comments').lean();
        posts.map(post => {
            post.likesCount = post.likes.length;
        });

        return res.status(200).json({
            status: true,
            message: 'Posts found',
            posts: posts
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Error fetching posts',
            error: err
        });
    }
}


module.exports = {
    authenticate,
    test,
    addUser,
    follow,
    unfollow,
    getUser,
    createPost,
    deletePost,
    likePost,
    unlikePost,
    addComment,
    getPost,
    getAllPosts
}
