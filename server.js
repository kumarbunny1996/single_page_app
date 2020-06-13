const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//dot env used to store the config in environment variables
const dotEnv = require('dotenv');
dotEnv.config();
const Friend = require('./models/model');

//creating express application
const app = express();

//connecting to mongodb
let db = process.env.DB_URL_CONNECTION;
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log('database is connected')).catch(error => console.log(error));

db = mongoose.connection;

//creating port
const port = process.env.PORT || 5000;

//bodyParser middleware function
app.use(bodyParser.json());


//adding the static folder to server
app.use(express.static('public'));

//allowing the static folder to access the dependencies in node modules
//by creating virtual path
//app.use('/scripts', express.static(__dirname + '/node_modules/'));

//storing the data in server
app.get('/api/friends', (req, res) => {
    Friend.find()
        .then(friendsData => res.status(200).json(friendsData))
        .catch(error => console.log(error));

    //res.status(200).json(friendsData);
});

//server collects the requested data
app.post('/api/add', (req, res) => {

    //data object
    const { name, age, email, group } = req.body;
    console.log(req.body);
    //validation purpose
    let ok = true;
    let errors = [];

    //checking the data and storing the msg to array
    if (!name || !age || !email || !group) {
        ok = false
        errors.push({ message: "please fill all fields" });
    }
    //validation process goes here
    if (errors.length > 0) {
        ok = false;
        errors.push({
            message: "failed"
        });
        res.json({ ok, errors });

    } else {
        //checking the same email id
        Friend.findOne({ email: email })
            .then(myFriend => {
                if (myFriend) {
                    ok = false;
                    errors.push({
                        message: 'your friend is already exists'
                    });
                    res.json({
                        ok,
                        errors
                    });
                } else {
                    //insert new doc to db
                    ok = true;
                    const newFriend = new Friend({
                        name,
                        age,
                        email,
                        group
                    });
                    newFriend.save().then(myFriend => {
                        let msg = 'your friend is successfully added';
                        res.status(200).json({ ok, myFriend, msg })
                    }).catch(error => {
                        console.log(error);
                        let msg = 'sorry! failed to add your friend';
                        res.status(400).json(msg);
                    });
                }
            });
    }
});

//deleting the data
app.delete('/api/friends/:_id', (req, res) => {

    let query = { _id: req.params._id };
    Friend.deleteOne(query)
        .then((result) => {

            let message = 'your friend is successfully removed';

            res.status(200).json({ result, message });
        })
        .catch(error => {
            if (error) {

                let message = 'sorry! your friend cannot be removed';

                res.status(400).json(message);
            }
        });
});

//update the data
app.put('/api/friends/:_id', (req, res) => {
    let { name, age, email, group } = req.body;
    let update = req.body;
    let id = req.params._id;
    let query = { _id: id };
    let errors = [];
    if (!name || !age || !email || !group) {
        errors.push({
            message: "please fill all fields"
        });
    }
    //validation process goes here
    if (errors.length > 0) {
        errors.push({
            message: "failed to update"
        });
        res.json({ errors });
    } else {
        Friend.findOne({
                _id: id,
                email: email
            })
            .then(myFriend => {
                if (myFriend) {
                    Friend.findOneAndUpdate(query, update, {
                            new: true,
                            useFindAndModify: false
                        })
                        .then(friend => {
                            let successMsg = "your friend is successfully updated";
                            res.json({ friend, successMsg });
                        }).catch(e => {
                            console.log(e);
                            let msg = 'sorry! failed to update your friend';
                            res.status(400).json(msg);
                        });

                } else {
                    errors.push({
                        message: 'your friend is already exists'
                    });
                    res.json({ errors });
                }
            });
    }
});

//search api
// app.get('/api/search/:name', (req, res) => {
//     let name = req.params.name;
//     let query = { name: name };
//     Friend.find(query).then(friend => res.json(friend));
// });
//listening to the port
app.listen(port, () => console.log('server is running at port ' + port));