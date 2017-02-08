var bcrypt    = require("bcrypt")
var UUID      = require('./utils/UUID-util')

var loggedInUsers = {} // key value pair of username and hash token
var oldTokens = {} // should timestamp this eventually, remove every 30 days?
var usernameFullnameMap = {} //TODO: prob a better way

var salt = bcrypt.genSaltSync(10)


module.exports.isIBM = function(username){
  var regex = /\S+@\S+\.ibm.com/
  return regex.test(username)
}

module.exports.setup = function(rows){
  rows.forEach(function(o){
    usernameFullnameMap[o.id] = {
      fullname: o.fullname,
      image_64: o.image_64
    }
  })
}

module.exports.addFullname = function(username, fullname, image_64){
  usernameFullnameMap[username] = {
    fullname: fullname,
    image_64: image_64
  }
}

module.exports.getFullname = function(username){
  return usernameFullnameMap[username]
}

// checks for valid username & token too
module.exports.checkUserTokenPair = function(username, t, res, err, callback){
  if(!t){
    err("Token param not found", res)
  }
  else if(!username){
    err("Username param not found", res)
  }
  else if(loggedInUsers[username] != t && oldTokens[t] != username){
    err("Invalid username token pair", res)
  }
  else if(loggedInUsers[username] != t && oldTokens[t] === username){
    err("Old token detected, login again", res)
  }
  else{
    callback()
  }
}

// checks for valid username & token too
module.exports.checkSlackTokenPair = function(username, t, res, err, callback){
  if(!t){
    err("Token param not found", res)
  }
  else if(!username){
    err("Username param not found", res)
  }
  else if(loggedInUsers[username] != t && oldTokens[t] != username){
    err("Invalid username token pair", res)
  }
  else if(loggedInUsers[username] != t && oldTokens[t] === username){
    err("Old token detected, login again", res)
  }
  else{
    callback()
  }
}



// creates user and return token
module.exports.createToken = function(username){
  // logged into new device, delete old token, make new one
  if(username in loggedInUsers){
    console.log("Replacing old token with new one")
    oldTokens[loggedInUsers[username]] = username
  }

  var token = UUID.randomUUID()
  loggedInUsers[username] = token

  return token
}

/* SLACK TOKEN only works for trade atm */
module.exports.createSlackToken = function(username){
  var token = UUID.randomUUID()
  return token
}


module.exports.logout = function(username, token, res, err, callback){
  if(username in loggedInUsers){
    if(loggedInUsers[username] === token){
      delete loggedInUsers[username]
      callback()
    }
    else{
      err("Invalid token", res)
    }
  }
  else{
    err("User not even logged in", res)
  }
}

module.exports.getToken = function(username){
  return loggedInUsers[username]
}

module.exports.hashPassword = function(password){
  return bcrypt.hashSync(password, salt)
}

module.exports.comparePasswords = function(password, hash){
  return bcrypt.compareSync(password, hash)
}
