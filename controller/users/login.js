
const connection = require('../../database/db_connection')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')
const { base64encode, base64decode } = require('nodejs-base64');


const loginGetController = (req, res) => {        //DONE
    // you can access this page ONLY if you're not logged in.
    try{             // if a cookie exists (currently logged in, or had logged out)
    const token_header = req.header('cookie')
    //var encrypted_token = token_header.split(";")[0].replace('session=', '')
    var encrypted_token = req.cookies.session;
    var token = JSON.parse(base64decode(encrypted_token)).token
    const decoded = jwt.verify(token, 'thisismynewcourse') // [TARGET]
    var sql = 'SELECT user_id FROM `tokens` WHERE user_id = ? && token = ?'
    
    connection.query(sql,[decoded.user_id, token] ,(err, result) => {
      if (err) throw err;
      if(result[0])
      {
      res.redirect('/home')
        
      }
      else
      {                     // if he's not logged in, show login page.
        res.render('log-in.ejs')
    
      }
    
    })
    }
    catch(e){                       // if no cookie exists
      console.log(e);
      console.log('Acessing login page (youre not logged in) caught!!')
      res.render('log-in.ejs')
    }
    
    }

const loginPostController = (req, res) => {

      // DATABASE LOGIC
      var sql = 'SELECT user_id, password FROM `users` WHERE username = ?'
      connection.query(sql,[req.body.username /*, req.body.password] */] ,(err, result) => {  // we just query by username
        //because we don't have hashed password so we can't send it to database
      
        if (err) throw err;
        if(result[0])        // IF THE RESULT OF THE QUERY IS NOT EMPTY (NO SUCH USERNAME)
        {
      
          var isMatch = bcrypt.compareSync(req.body.password, result[0].password)
          if(isMatch) {
            generate_token(result[0].user_id,req ,res , jwt)
          }
          else{
            res.send('failed to login')
          }
      
        }
        else
        {
        res.send('failed to login')
        }
      
      
       
      
      })
      
  }
  
function generate_token(user_id, req, res, jwt){
  
        const token = jwt.sign({ user_id: user_id} ,'thisismynewcourse')
      
        // store token in browser cookie
        req.session.token = token;     // the thing stored here is encoded.
      
        // store token in database
        var post = {user_id: user_id, token: token}
        var sql = 'INSERT INTO tokens SET ?' // need to find a way of inserting..
        connection.query(sql, post, (err, result, fields) => {
          if(err) throw err;
      
          res.redirect('/home');   // redirect to welcome (homepage) when u log in.
      
        //  res.send('done')
      
        })
      
      }

module.exports = {loginGetController, loginPostController}