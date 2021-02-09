const User = require('../models/user');
const passport = require('passport');
const {body, validationResult} = require('express-validator')
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/avatars/');
    },
    filename: function (req, file, cb) {
        cb(null,  uuidv4() +  file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

exports.login_get = function(req, res, next){
    res.render('user_login', {locals: {title: 'Login'}});
}

exports.login_post = [   
    body('username').trim().isLength({min:1}).withMessage('Username Required').isAlphanumeric().withMessage("Username can only contain Alphanumeric values"),
    body('password').trim().isLength({min:1}).withMessage('Password Required'),
    function(req, res, next){
        let err = validationResult(req);
        let extractedErrorMessages = [];

        if(!err.isEmpty())
        {
            err.array().map((er)=>{extractedErrorMessages.push(er.param.toUpperCase()+': '+er.msg)});
            res.render('user_login', {locals: {title: 'Login', error: extractedErrorMessages}});
            return;
        }

        passport.authenticate('signin', function(err, user, info){
            if(err){return next(err);}
            if(!user){  return res.render('user_login', {error:req.body.username+" doesn't exists Or you entered a wrong password"} )};
            req.login(user, {session: false}, function(err){
                if(err){return next(err);};
                return res.json(req.user.toAuthJson());
            })
        })(req, res, next);
    }
];

exports.register_get = function(req, res, next){
    res.render('user_register', {locals:{title: 'register'}});
};

exports.register_post = [
    upload.single('avatar'),
    (err, req, res, next)=>{
        // if any error in file upload
        if(err){
            let newUser = {
                username: req.body.username,
                password: req.body.password,
                confirmpassword: req.body.confirmpassword,
                isManager: req.body.isManager
            }
    
            let ourMessage = [];
            ourMessage.push("Image Size Should be less than 5MB and file type should be jpeg, jpg or png.");
            return res.render('user_register', {locals: {title: 'register', user: newUser, error: ourMessage}});  
        }
        next();
    },
    body('username').trim().isLength({min:1}).withMessage('Username Required').isAlphanumeric().withMessage("Username can only contain Alphanumeric"),
    body('password').trim().isLength({min:1}).withMessage('Password Required'),
    body('confirmpassword').trim().custom((value, {req})=>{
        if(value!==req.body.password)
        {
            throw new Error("Password and Confirmpassword do not match");
        }
        return true;
    }),
    function(req, res, next){

        let err = validationResult(req);
        let extractedErrorMessages = [];
        let newUser = {
            username: req.body.username,
            password: req.body.password,
            confirmpassword: req.body.confirmpassword,
            isManager: req.body.isManager===undefined?false:true,
            avatarName: req.file===undefined?'':req.file.filename
        }

        if(!err.isEmpty())
        {
            err.array().map((er)=>{extractedErrorMessages.push(er.param.toUpperCase()+': '+er.msg)})
            res.render('user_register', {locals: {title: 'register', user: newUser, error: extractedErrorMessages}});
            return;
        }
        else{
            User.findOne({username: newUser.username}, async function(err, user){
                if(err)
                {
                    return next(err);
                }
                if(user)
                {
                    extractedErrorMessages.push('Username '+newUser.username+' already taken!')
                    res.render('user_register', {locals: {title: 'register', error: extractedErrorMessages}})
                }
                else{

                    let newuser = new User(newUser);
        
                    await newuser.encryptPassword();
                    
                    newuser.save(function(err){
                        if(err){throw err;}
                        })
        
                    res.redirect('/auth/login');
                }
           });
        }

    }
];
