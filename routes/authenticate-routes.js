/**
 * Created by RabbiaUmer on 6/2/16.
 */

module.exports = function (app, express, jwt, mongoose) {

  var User = require('./../models/user')(mongoose);

  // // get an instance of the router for auth routes
  // var authRoutes = express.Router();

  // route to authenticate a user (POST http://localhost:8080/api/authenticate)
  app.post('/login', function (req, res) {
    // find the user
    User.findOne({
      email: req.body.email
    }, function (err, user) {

      if (err) throw err;

      if (!user) {
        res.json({success: false, message: 'Authentication failed. User not found.'});
      } else if (user) {

        // check if password matches
        if (!user.comparePassword(req.body.password)) {
          res.json({success: false, message: 'Authentication failed. Wrong password.'});
        } else {

          // if user is found and password is right
          // create a token
          var token = jwt.sign(user, app.get('appSecret'), {
            expiresIn: 60 * 60 * 24  // expires in 24 hours
          });

          // return the information including token as JSON
          res.json({
            success: true,
            message: 'Enjoy your token!',
            token: token
          });
        }

      }

    });
  });

  // Signup route
  app.post('/signup', function (req, res) {

    // check to make sure if there is something sent in abody
    if (Object.keys(req.body).length) {
      User.findOne({
        email: req.body.email
      }, function (err, member) {

        if (err) {
          throw err;
        }

        if (member) {
          res.status(403).json({
            success: false,
            message: "User already exists"
          });
        } else {

          var defaultUserLevel = 0;

          var newPlayer = new User();
          newPlayer.firstName = req.firstName;
          newPlayer.lastName = req.lastName;
          newPlayer.email = req.body.email;
          newPlayer.password = newPlayer.createPasswordHash(req.body.password);
          newPlayer.level = defaultUserLevel;
          newPlayer.save(function (err, user) {
            console.log(err);
            if (err) {
              throw err;
            }

            // if player/user has been created, create a new token
            // create a token
            var token = jwt.sign(user, app.get('appSecret'), {
              expiresIn: 60 * 60 * 24 // expires in 24 hours
            });

            res.status(200).json({
              success: true,
              message: "Signed up successfully",
              token: token
            });

          });
        }

      });
    } else {
      res.status(403).json({
        success: false,
        message: "no data sent"
      });
    }


  });

  app.get('/test', function (req, res) {
    res.send("something");
  })

  // route middleware to verify a token
  app.use(function (req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // Note: the above req.body object is attached by bodyParser from the body parser middleware in app.js

    // decode token
    if (token) {

      // verifies secret and checks exp
      jwt.verify(token, app.get('appSecret'), function (err, decoded) {
        if (err) {
          return res.json({success: false, message: 'Failed to authenticate token.'});
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;
          next();
        }
      });

    } else {

      // if there is no token
      // return an error
      return res.status(403).send({
        success: false,
        message: 'No token provided.'
      });

    }
  });

  // put the routes here that needs to be protected


};

