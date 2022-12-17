const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');

chai.use(chaiHttp);

describe("Social Media", () => {

    before(function(done)  {
        this.timeout(10000);
        User.deleteMany({}, (err) => {
            Comment.deleteMany({}, (err) => {
                Post.deleteMany({}, (err) => {
                    done();
                });
            });

        });

    });

    let token = null;
    let userId = null;
    let user2Id = null;
    let postId = null;

    describe("GET /test", () => {
        it("it should GET the test endpoint", (done) => {
            chai.request(server)
                .get('/api/test')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eq('Hello World');
                    done();
                });
        });

        it("it should not GET tests", (done) => {
            chai.request(server)
                .get('/api/tests')
                .end((err, res) => {
                    res.should.have.status(404);
                });
            done();
        });
    });

    describe("POST /user", () => {
        it("it should create a user", (done) => {
            const user = {
                name: "test",
                email: "test@test.com",
                password: "test"
            };
            chai.request(server)
                .post('/api/addUser')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eq('User added successfully');
                    res.body.should.have.property('status').eq(true);
                    res.body.should.have.property('user');
                    userId = res.body.user._id;
                    done();
                });
        });

        it("it should create another user", (done) => {
            const user = {
                name: "test1",
                email: "test1@test.com",
                password: "test1"
            };
            chai.request(server)
                .post('/api/addUser')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eq('User added successfully');
                    res.body.should.have.property('status').eq(true);
                    res.body.should.have.property('user');
                    user2Id = res.body.user._id;
                    done();
                });
        });

        it("it should not create a user", (done) => {
            const user = {
                name: "test",
                email: "test@test.com",
                password: "test"
            };
            chai.request(server)
                .post('/api/addUser')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(409);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eq('User already exists');
                    done();
                });
        });
    });

    describe("POST /authenticate", () => {
        it("it should authenticate a user", (done) => {
            const user = {
                email: "test@test.com",
                password: "test"
            };
            chai.request(server)
                .post('/api/authenticate')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eq('User authenticated');
                    res.body.should.have.property('token');
                    res.body.should.have.property('status').eq(true);
                    token = res.body.token;
                    done();
                });
        });

        it("it should not authenticate a user", (done) => {
            const user = {
                email: "test@test.com",
                password: "test1"
            };
            chai.request(server)
                .post('/api/authenticate')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eq('Wrong password');
                    done();
                });
        });

        it("it should not authenticate a user", (done) => {
            const user = {
                email: "test2@test.com",
                password: "test"
            };
            chai.request(server)
                .post('/api/authenticate')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eq('User not found');
                    done();
                });
        });
    });

    describe("POST /follow", () => {
        console.log("token", token);
        it("it should follow a user", (done) => {
            chai.request(server)
                .post(`/api/follow/${user2Id}`)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eq('User followed successfully');
                    res.body.should.have.property('status').eq(true);
                    done();
                });
        });

        it("it should not follow a user", (done) => {
            chai.request(server)
                .post(`/api/follow/gresgwhergvb`)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eq('User not found');
                    done();
                });
        });
    });

    describe("POST /unfollow", () => {
        it("it should unfollow a user", (done) => {
            chai.request(server)
                .post(`/api/unfollow/${user2Id}`)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eq('User unfollowed successfully');
                    res.body.should.have.property('status').eq(true);
                    done();
                });
        });
    });

    describe("POST /posts", () => {
        it("it should create a post", (done) => {
            const post = {
                title: "test",
                description: "test"
            };
            chai.request(server)
                .post('/api/posts')
                .set('Authorization', `Bearer ${token}`)
                .send(post)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eq('Post created successfully');
                    res.body.should.have.property('status').eq(true);
                    res.body.should.have.property('post');
                    postId = res.body.post._id;
                    done();
                });
        });
    });

    describe("GET /posts/:id", () => {
        it("it should get posts", (done) => {
            chai.request(server)
                .get('/api/posts/' + postId)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eq('Post found');
                    res.body.should.have.property('status').eq(true);
                    res.body.should.have.property('post');
                    done();
                });
        });
    });

    describe("POST /like/:id", () => {
        it("it should like a post", (done) => {
            chai.request(server)
                .post('/api/like/' + postId)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eq('Post liked successfully');
                    res.body.should.have.property('status').eq(true);
                    done();
                });
        });
    });

    describe("POST /unlike/:id", () => {
        it("it should unlike a post", (done) => {
            chai.request(server)
                .post('/api/unlike/' + postId)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eq('Post unliked successfully');
                    res.body.should.have.property('status').eq(true);
                    done();
                });
        });
    });

    describe("POST /comment/:id", () => {
        it("it should comment a post", (done) => {
            const comment = {
                comment: "test"
            };
            chai.request(server)
                .post('/api/comment/' + postId)
                .set('Authorization', `Bearer ${token}`)
                .send(comment)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eq('Comment added successfully');
                    res.body.should.have.property('status').eq(true);
                    done();
                });
        });
    });

    describe("GET /all_posts", () => {
        it("it should get all posts", (done) => {
            chai.request(server)
                .get('/api/all_posts')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eq('Posts found');
                    res.body.should.have.property('status').eq(true);
                    res.body.should.have.property('posts');
                    done();
                });
        });
    });

});

