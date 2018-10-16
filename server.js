var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var mongoose = require('mongoose');
var session = require("express-session");

app.use(session({secret: 'secretkeysecret'}));
const flash = require('express-flash');
app.use(flash());

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost/message_board');
mongoose.Promise = global.Promise;

var MessageSchema = new mongoose.Schema(
    {
    name: { type: String, required: [true, 'Why no name?'], minlength: [2, 'Name must be at least 2 characters.']},
    message: { type: String, required: true, minlength: 5},
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]
    },
    {timestamps:true}
    );

var CommentSchema = new mongoose.Schema(
    {
    name: { type: String, required: true, minlength: 2},
    comment: { type: String, required: true, minlength: 5},
    ///this refers to the Message model - one to many relationship
    _message: {type: mongoose.Schema.Types.ObjectId, ref: 'Message'},
    },
    {timestamps:true}
    );

mongoose.model('Message', MessageSchema);
mongoose.model('Comment', CommentSchema)
    
var Message = mongoose.model('Message')
var Comment = mongoose.model('Comment')

app.get('/',function(request,response){
    // Message.remove({}, function(err){})
    Message.find({}).populate('comments').exec(function(err,messages){
        if(err){
            console.log('something went wrong saving user');
            response.json(err);
        }
        else{
            console.log(messages)
            response.render('index',{messages:messages})
        }
    });
});

app.post('/addnew',function(request,response){
    var newmessage = new Message(request.body);

    newmessage.save(function(err, obj){
        if(err){
            console.log('something went wrong saving user');
            for(var key in err.errors){
                request.flash('index', err.errors[key].message);
            }

            // response.render('index', {errors: err.errors});

            response.json(err);
        }
        else{
            console.log("success", obj)
            response.redirect('/');
        }
    })
})

app.post('/addnew/:id',function(request,response){
    Message.findOne({_id:request.params.id}, function(err,message){
        if(err){
            console.log('something went wrong saving user');
            response.json(err);
        }
        else{
            var newcomment = new Comment({
                _message: request.params.id,
                name: request.body.name,
                comment: request.body.comment
            });
            console.log(newcomment)
            newcomment.save(function(err){
                if(err)
                    response.json(err);
                else{
                    message.comments.push(newcomment._id);
                    message.save(function(err){
                        if(err)
                            response.json(err);
                        else
                            response.redirect('/');
                    });
                };
            });
        };  
    });
});

// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("listening on port 8000");
})


// app.post('/message', function (req, res){

//     console.log(req.body);
//     var newMessage = new Message({
//         name: req.body.name,
//         text: req.body.text
//     });
//     newMessage.save(function(err){
//         if(err)
//         console.log("Not right");
//         .populate('comments');
//         .exec(function);
//     })
// }
