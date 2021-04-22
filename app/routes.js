module.exports = function(app, passport, db) {
var ObjectId = require('mongodb').ObjectID;
// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('messages').find().toArray((err, result) => {
          if (err) return console.log(err)
          res.render('profile.ejs', {
            user : req.user,
            messages: result
          })
        })
    });

   // NAVIGATING THROUGH NAV BAR WITHIN PROFILE ===========================================================================

    // GO BACK TO HOMEPAGE =========================
    app.get('/index', isLoggedIn, function(req, res) {
      db.collection('messages').find().toArray((err, result) => {
        if (err) return console.log(err)
        res.render('index.ejs', {
          user : req.user,
          messages: result
        })
      })
  });

   // EMERGENCY=========================
   app.get('/emergency', isLoggedIn, function(req, res) {
    db.collection('messages').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('emergency.ejs', {
        user : req.user,
        messages: result
      })
    })
});

 // MISSION=========================
 //how do i get just the mission part of index to load when clicking on this?
 //consider making another ejs page call mission to router to this
 app.get('/#four', isLoggedIn, function(req, res) {
  db.collection('messages').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', {
      user : req.user,
      messages: result
    })
  })
});

 // MAKE A POST=========================

 //show me all the post user made
 app.get('/blogposting', isLoggedIn, function(req, res) {
  //  think of it as issuing a database query
  db.collection('newarticle').find().toArray((err, result) => {
    if (err) return console.log(err)
    console.log(result)
    res.render('blogposting.ejs', {
      // these below are the collections within the db
      user : req.email,
      article: result,
      // what information do you want to get from the DB to display on your browser?
    })
  })
});

// POSTING A BLOG > NEW ARTICLE  ===================
app.get('/newarticle', isLoggedIn, function(req, res) {
  db.collection('newarticle').find().toArray((err, result) => {
    // it is going into the DB to find this info in the function below
    if (err) return console.log(err)

    res.render('newarticle.ejs', {
      user : req.user,
      title: String,
      createdAt: new Date(),
      description: String,
      bpost: String,
    })
  })
});




// POSTING A BLOG > NEW ARTICLE  ===================
app.post('/newarticle', (req, res) => {
  db.collection('newarticle').save({
    user : req.user,
    title: req.body.title,
    createdAt: new Date(),
    description: req.body.description,
    bpost: req.body.blogpost,
  }, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/blogposting')
    //this is going to redirect the button submit to blogposting
  })
})

// POSTING A BLOG > DELETE BUTTON ===================
//received help from mentor Michael Kazin
app.get('/blogposting/:id',  (req, res) => {
  db.collection('newarticle').findOneAndDelete({
    _id: ObjectId(req.params.id),
  }, (err, result) => {
    console.log(result)
    if (err) return res.send(500, err)
    res.redirect('/blogposting')
  })
})
//this get route gives functionality to the delete button to work

// READ MORE BUTTON  ===================
//received help from Maria Christina (Alum)
app.get('/blogposting/:id',  (req, res) => {
  db.collection('newarticle').findOne({
    _id: ObjectId(req.params.id),
  }, (err, result) => {
    console.log(result)
    console.log(req.params.id)
    if (err) return res.send(500, err)
    res.redirect('/blogposting')
  })
})
//this gives the fucntionalitty to read more



 // BLOG =========================
    app.get('/blog', isLoggedIn, function(req, res) {
      db.collection('messages').find().toArray((err, result) => {
        if (err) return console.log(err)
        res.render('blog.ejs', {
          user : req.user,
          messages: result
        })
      })
  });




 // RESOURSE =========================
 app.get('/resources', isLoggedIn, function(req, res) {
  db.collection('messages').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('resources.ejs', {
      user : req.user,
      messages: result
    })
  })
});







    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// message board routes ===============================================================

    app.post('/messages', (req, res) => {
      db.collection('messages').save({
        name: req.body.name,
        msg: req.body.msg,
        thumbUp: 0,
        thumbDown:0}, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/profile')
      })
    })

    app.put('/messages', (req, res) => {
      db.collection('messages')
      .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
        $set: {
          thumbUp:req.body.thumbUp + 1
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.put('/messages/thumbDown', (req, res) => {
      db.collection('messages')
      .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
        $set: {
          thumbUp:req.body.thumbUp - 1
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.delete('/messages', (req, res) => {
      db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
