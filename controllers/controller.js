const {pool} = require('../db.js');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const test = async (req, res) => {
    return res.status(200).json({
        message: 'Hello World'
    });
}

const addUser = async (req, res) => {
    const {name, email, password} = req.body;
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const query = `INSERT INTO users (username,email,password) VALUES ('${name}','${email}','${hash}')`;
    try {
        await pool.query(query);
        return res.status(200).json({
            message: 'User added successfully'
        });
    } catch (err) {
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
        let user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        user = user.rows[0];
        const hash = crypto.createHash('sha256').update(password).digest('hex');
        if (hash !== user.password) {
            return res.status(401).json({
                message: 'Wrong password'
            });
        }
        return jwt.sign({
            email: user.email,
            username: user.username
        }, process.env.TOKEN_SECRET, {expiresIn: '1800s'}, async (err, token) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: 'Error generating token',
                    error: err
                });
            }
            return res.header({token: token}).status(200).json({
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
    const following = req.params?.following;


    const query = `INSERT INTO user_data (follower,following) VALUES ('${user}','${following}')`;
    try {
        await pool.query(query);
        return res.status(200).json({
            message: 'Followed Successfully'
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Error following user',
            error: err
        });
    }
}

const unfollow = async (req, res) => {
    const user = req.user.email;
    const following = req.params?.following;


    const query = `DELETE FROM user_data WHERE follower = '${user}' AND following = '${following}'`;
    try {
        await pool.query(query);
        return res.status(200).json({
            message: 'Unfollowed Successfully'
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Error unfollowing user',
            error: err
        });
    }
}

const getUser = async (req, res) => {
    const user = req.user;
    const userEmail = req.user.email;
    const query = `SELECT * FROM user_data WHERE follower = $1`;
    const query2 = `SELECT * FROM user_data WHERE following = $1`;
    try {
        let followers = await pool.query(query, [userEmail]);
        let following = await pool.query(query2, [userEmail]);
        delete user.iat;
        delete user.exp;
        delete user.email;
        user.followingCount = followers.rows.length;
        user.followersCount = following.rows.length;
        return res.status(200).json({
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
    const user = req.user.email;
    const query = `INSERT INTO posts (title,description,uid) VALUES ('${title}','${description}','${user}')   RETURNING *`;
    try {
        const data = await pool.query(query);
        delete data.rows[0].uid;
        return res.status(200).json({
            message: 'Post added successfully',
            post: data.rows[0]
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
    const user = req.user.email;
    const query = `DELETE FROM posts WHERE pid = $1 AND uid = $2`;
    const query2 = `DELETE FROM comments WHERE pid = $1`;
    const query3 = `DELETE FROM likes WHERE pid = $1`;
    try {
        await pool.query(query, [id, user]);
        await pool.query(query2, [id]);
        await pool.query(query3, [id]);
        return res.status(200).json({
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
    const user = req.user.email;
    const query = `INSERT INTO like_posts (pid,uid) VALUES ('${id}','${user}')`;

    try {
        await pool.query(query);
        return res.status(200).json({
            message: 'Liked Successfully'
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
    const user = req.user.email;
    const query = `DELETE FROM like_posts WHERE pid = $1 AND uid = $2`;

    try {
        await pool.query(query, [id, user]);
        return res.status(200).json({
            message: 'Unliked Successfully'
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
    const {comment} = req.body;
    const user = req.user.email;
    const query = `INSERT INTO comments (pid,comment_des,uid) VALUES ($1,$2,$3) RETURNING idx`;

    try {
        const commentData = await pool.query(query, [id, comment, user]);
        return res.status(200).json({
            message: 'Comment added successfully',
            commentId: commentData.rows[0].idx
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
    const query = `SELECT * FROM posts WHERE pid = $1`;
    try {
        const data = await pool.query(query, [id]);
        const query1 = `SELECT * FROM comments WHERE pid = $1`;
        const data1 = await pool.query(query1, [id]);
        const query2 = `SELECT * FROM like_posts WHERE pid = $1`;
        const data2 = await pool.query(query2, [id]);
        return res.status(200).json({
            message: 'Post fetched successfully',
            post: data.rows[0],
            likesCount: data2.rowCount,
            commentsCount: data1.rowCount,
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
    const user = req.user.email;
    const query = `SELECT * FROM posts WHERE uid = $1 ORDER BY created_at ASC`;
    try {
        const data = await pool.query(query, [user]);
        for (const post of data.rows) {
            const query1 = `SELECT * FROM comments WHERE pid = $1`;
            delete post.uid;
            const data1 = await pool.query(query1, [post.pid]);
            const query2 = `SELECT * FROM like_posts WHERE pid = $1`;
            const data2 = await pool.query(query2, [post.pid]);
            post.comments = data1.rows;
            post.likesCount = data2.rowCount;
        }
        return res.status(200).json({
            message: 'Posts fetched successfully',
            posts: data.rows
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