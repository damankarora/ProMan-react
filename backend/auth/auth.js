const passport = require('passport')
const localStrategy = require('passport-local').Strategy;
const DBWrapper = require('./../database/connection');

passport.use(new localStrategy(
    {
        usernameField: 'username',
        passwordField: 'password'
    },
    async(username, password, done) =>{
        try{
            let user = await DBWrapper.findUser(username);
            if(user === null){
                return done(null, false, { message: 'User not exists' });
            }
            let matched = DBWrapper.matchPassword(user, password);
            if(!matched){
                return done(null, false, { message: 'Incorrect password' });
            }
            return done(null, user);
        }
        catch(err){
            console.log(err);
            return done(err);

        }
    }
));

passport.serializeUser((user, done)=>{
    done(null, user['user_id']);
});

passport.deserializeUser(async (id, done)=>{
    const user = await DBWrapper.findUserById(id);
    done(null, user);
})


const registerNewUser = async (username, password)=>{
    const user = await DBWrapper.findUser(username)
    if (user !== null){
        
        return null;
    }
    
    await DBWrapper.createUser(username, password);
    
    const results = await DBWrapper.findUser(username);
    
    return results;
}

module.exports = {
    passport,
    DBWrapper,
    registerNewUser
}