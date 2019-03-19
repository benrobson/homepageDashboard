//
// Project Dependencies
//
const express = require('express');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const mysql = require('mysql');
const ejs = require('ejs');
const sessions = require('express-session');

//
// Constants
//
const app = express();
const config = require('./config.json');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
var obj = {};
var session;

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static('public'));

app.use(sessions({
  secret: process.env.sessionsecret || config.sessionsecret,
  resave: false,
  saveUninitialized: true
}));

const connection = mysql.createConnection({
  host: process.env.databasehost || config.databasehost,
  user: process.env.databaseuser || config.databaseuser,
  password: process.env.databasepassword || config.databasepassword,
  database: process.env.databasedatabase || config.databasedatabase
});

connection.connect(function(err) {
  if (err) {
    console.error(chalk.red('[ERROR] ') + chalk.blue('[DB] ') +  'There was an error connecting:\n' + err.stack);
    return;
  }
  console.log(chalk.yellow('[CONSOLE] ' ) + chalk.blue('[DB] ') + 'Database connection is successful. Your connection ID is ' + connection.threadId + '.');
});

//
// Homepage
//

// Favorites [Main]
app.get('/', function (req, res) {
  let sql = `SELECT * FROM homepageDashboard WHERE category LIKE 'favorites'`;
  connection.query (sql, function (err, result) {
    if (err) {
      throw err;
    } else {
      obj = {objdata: result};
      res.render('index', obj)
    }
  });
});

// Social Media
app.get('/socialmedia', function (req, res) {
  let sql = `SELECT * FROM homepageDashboard WHERE category LIKE 'socialmedia'`;
  connection.query (sql, function (err, result) {
    if (err) {
      throw err;
    } else {
      obj = {objdata: result};
      res.render('index', obj)
    }
  });
});

// Ministry
app.get('/ministry', function (req, res) {
  let sql = `SELECT * FROM homepageDashboard WHERE category LIKE 'ministry'`;
  connection.query (sql, function (err, result) {
    if (err) {
      throw err;
    } else {
      obj = {objdata: result};
      res.render('index', obj)
    }
  });
});

// Streaming
app.get('/streaming', function (req, res) {
  let sql = `SELECT * FROM homepageDashboard WHERE category LIKE 'streaming'`;
  connection.query (sql, function (err, result) {
    if (err) {
      throw err;
    } else {
      obj = {objdata: result};
      res.render('index', obj)
    }
  });
});

// Utilities
app.get('/utilities', function (req, res) {
  let sql = `SELECT * FROM homepageDashboard WHERE category LIKE 'utilities'`;
  connection.query (sql, function (err, result) {
    if (err) {
      throw err;
    } else {
      obj = {objdata: result};
      res.render('index', obj)
    }
  });
});

// Development
app.get('/development', function (req, res) {
  let sql = `SELECT * FROM homepageDashboard WHERE category LIKE 'development'`;
  connection.query (sql, function (err, result) {
    if (err) {
      throw err;
    } else {
      obj = {objdata: result};
      res.render('index', obj)
    }
  });
});

// Other Resources
app.get('/otherresources', function (req, res) {
  let sql = `SELECT * FROM homepageDashboard WHERE category LIKE 'otherresources'`;
  connection.query (sql, function (err, result) {
    if (err) {
      throw err;
    } else {
      obj = {objdata: result};
      res.render('index', obj)
    }
  });
});

//
// Session Management
// Login
//
app.get('/login', function (req, res) {
  session = req.session;
  if (session.uniqueID) {
    res.redirect('/admin');
  } else {
    res.render('login');
  };
});

app.post('/login', urlencodedParser, function (req, res) {
  session = req.session;
  if (req.body.username == config.adminpaneluser && req.body.password == config.adminpanelpassword) {
    session.uniqueID = req.body.username;
    res.redirect('/admin');
    console.log(chalk.yellow('[CONSOLE] ') + chalk.magenta('[ADMIN] ') + 'A user has successfully logged in as Administrator.');
  } else {
    res.redirect('/login');
    console.log(chalk.yellow('[CONSOLE] ') + chalk.magenta('[ADMIN] ') + chalk.red('[ERROR] ') + 'A user has attemped to log into the Administration panel, but failed.');
  };
});

app.get('/admin', function (req, res) {
  session = req.session;
  if (session.uniqueID) {
    let sql = `SELECT * FROM homepageDashboard`;
    connection.query (sql, function (err, result) {
      if (err) {
        throw err;
      } else {
        obj = {objdata: result};
        res.render('admin', obj)
      }
    });
  } else {
    res.redirect('/');
  };
});

//
// Logout
//
app.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/');
  console.log(chalk.yellow('[CONSOLE] ') + chalk.magenta('[ADMIN] ') + 'A user has successfully logged out as Administrator.');
});

//
// Add
//
app.get('/add', function (req, res) {
  session = req.session;
  if (session.uniqueID) {
    res.render('add');
  } else {
    res.redirect('/');
  };
});

app.post('/add', urlencodedParser, function (req, res) {
  session = req.session;
  if (session.uniqueID) {
    let sql = `INSERT INTO homepageDashboard (name, link, description, image, category) VALUES ('${req.body.name}', '${req.body.link}', '${req.body.description}', '${req.body.Image}', '${req.body.category}')`;
    connection.query (sql, function (err, result) {
      if (err) {
        throw err;
      } else {
        res.redirect('/admin');
        console.log(req.body);
        console.log(chalk.blue('[DB] ') + `The following record has been inserted into the database successfully.`);
      }
    });
  } else {
    res.redirect('/');
  };
});

//
// Edit
//
app.get('/edit', urlencodedParser, function (req, res) {
  session = req.session;
  if (session.uniqueID) {
    let sql = `SELECT * FROM homepageDashboard WHERE id='${req.query.id}'`;
    connection.query (sql, function (err, result) {
      if (err) {
        throw err;
      } else {
        console.log(result);
        obj = {objdata: result};
        res.render('edit', obj);
      }
    });
  } else {
    res.redirect('/');
  };
});

app.post('/edit', urlencodedParser, function (req, res) {
  session = req.session;
  if (session.uniqueID) {
    let sql = `UPDATE homepageDashboard SET name = '${req.body.name}', link = '${req.body.link}', description = '${req.body.description}', image = '${req.body.image}', category = '${req.body.category}' WHERE id = ${req.body.id}`;
    connection.query (sql, function (err, result) {
      if (err) {
        throw err;
      } else {
        res.redirect('/admin');
        console.log(chalk.blue('[DB] ') + `The following record in the database has been updated successfully.`);
      }
    });
  } else {
    res.redirect('/');
  };
});

//
// Remove
//
app.get('/remove', urlencodedParser, function (req, res) {
  session = req.session;
  if (session.uniqueID) {
    let sql = `DELETE FROM homepageDashboard WHERE id='${req.query.id}'`;
    connection.query (sql, function (err, result) {
      if (err) {
        throw err;
      } else {
        res.redirect('/admin');
        console.log(chalk.blue('[DB] ') + `The following record with the ID of ${req.query.id} has been removed from the database successfully.`);
      };
    })}
});

//
// Application Boot
//
app.listen(process.env.PORT || '8080');
console.log(chalk.yellow('[CONSOLE] ' ) + 'Application is listening to the port ' + '8080');
