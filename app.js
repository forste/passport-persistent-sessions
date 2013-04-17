
/**
 * Module dependencies.
 */

var express = require('express')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , MongoStore = require('connect-mongodb')
  , mongodb = require('mongodb')
  , mongoose = require('mongoose')
  , createUser = require('./schemas/user')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , conf = require('./conf')
  , User;


User = createUser(mongoose);
var app = express();

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(express.session());
    app.use(passport.initialize());
    app.use(passport.session({
        maxAge: new Date(Date.now() + 3600000),
        store: new MongoStore(
            {
                db: mongodb.Db(
                    conf.mongodbName,
                    new mongodb.Server(
                        'localhost',
                        27017,
                        {
                            auto_reconnect: true,
                            native_parser: true
                        }
                    ),
                    {
                        journal: true
                    }
                )
            },
            function(error) {
                if(error) {
                    return console.error('Failed connecting mongostore for storing session data. %s', error.stack);
                }
                return console.log('Connected mongostore for storing session data');
            }
        )
    }));
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

console.log('Connecting to MongoDB database');
mongoose.connect(conf.mongodbURL, function (error) {
    if(error) {
        console.error('Could not connect to MongoDB database. Exiting. %s', error.stack);
        return process.exit(1);
    }
    return console.log('Connected Mongoose to MongoDB database');
});

passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    function(email, password, done) {
        console.log('user %s attempting to authenticated', email);
        return User.findOne({email:email}, function(error, user) {
            if(error) {
                console.error('Failed saving user %s. %s', user.id, error.stack);
                return done(error);
            }
            if(!user) {
                return done(null, false);
            }
            console.log('user %s logged in successfully', user.id);
            return done(null, { //passed to callback of passport.serializeUser
                id : user.id
            });
        });
    }
));


passport.serializeUser(function(user, done) {
    return done(null, user.id); //this is the 'user' property saved in req.session.passport.user
});

passport.deserializeUser(function (id, done) {
    return User.findOne({ id: id }, function (error, user) {
        return done(error, user);
    });
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

app.post('/login', function(req, res, next) {
    console.log('/login');
    next();
}, passport.authenticate('local', {
    successRedirect : '/json/login/success',
    failureRedirect : '/json/login/failure'
}));

app.post('/json/logout', function(req, res) {
    console.log('/json/logout');
    req.logout();
    return res.send(200);
});


app.get('/json/login/success', function(req, res) {
    console.log('/json/login/success');
    return User.findOne({id : req.session.passport.user }, function(error, user) {
        var props;
        if(error) {
            console.error('Failed finding user %s. %s', req.session.passport.user, error.stack);
            return res.send(500);
        }
        if(!user) {
            console.error('Could not find user %s', req.session.passport.user);
            return res.send(404);
        }
        return res.send(200);
    });
});

app.get('/json/login/failure', function(req, res) {
    console.log('/json/login/failure');
    return res.send(401);
});

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
