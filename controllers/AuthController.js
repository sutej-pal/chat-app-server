const LoginValidator = require("../validators/app/login_validator");
const RegisterValidator = require("../validators/register_validator");

const User = require("../models/user");
const LoginLog = require("../models/login_log");

const JWT = require("jsonwebtoken");

const Bcrypt = require("bcrypt");

module.exports = class AuthController {
    static signUp(req, res) {
        const validator = new RegisterValidator(req);

        if (validator.fails()) {
            return res.status(422).json({
                message: "Some validation error occurred!",
                errors: validator.errors().all()
            });
        }
        const validated = validator.validated;
        User.findOne({email: validated.email})
            .then(user => {
                if (user) {
                    // user exists
                    if (user.email === validated.email) {
                        return res.status(422).json({
                            message: "Email already in use!",
                            errors: {email: ["Email already in use!"]}
                        });
                    }
                    if (user.username === validated.username) {
                        return res.status(422).json({
                            message: "Username already taken!",
                            errors: {username: ["Username already taken!"]}
                        });
                    }
                } else {
                    User.create(validated)
                        .then(user => {
                            // TODO: Send user verification email
                            return res.json({
                                message: "Registration Successful!",
                                data: user
                            });
                        })
                        .catch(e => {
                            throw e;
                        });
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({message: "Some error occured!"});
            });
    }

    static login(req, res) {
        const validator = new LoginValidator(req);
        let ipAddress = req.connection.remoteAddress;
        if (validator.fails()) {
            return res.status(422).json({
                message: "Some validation error occurred!",
                errors: validator.errors().all()
            });
        }

        const validated = validator.validated;

        User.findOne({
            $or: [{email: validated.email}, {username: validated.username}]
        })
            .then(user => {

                if (!user) {
                    return res.status(422).json({
                        message: "User not found!",
                        errors: {username: ["User not found!"]}
                    });
                } else {
                    if (!user.compareHash(validated.password)) {
                        return res.json({
                            message: "Login Successful!",
                            data: user
                        });
                    }
                    //
                    //     LoginLog.create({user: user.id, ipAddress: ipAddress, status: 0});
                    //
                    //     return res.status(422).json({
                    //         message: "Password incorrect!",
                    //         errors: {password: ["Password incorrect!"]}
                    //     });
                    // }
                    // JWT.sign(user.toObject(), process.env.APP_KEY, {expiresIn: "365 days"}, function (err, token) {
                    //         if (err) {
                    //             throw err;
                    //         }
                    //         ApiToken.create({email: user.email, token: token})
                    //             .then(apiToken => {
                    //                 // TODO: Send login alert
                    //                 // TODO: Track user ip
                    //
                    //                 LoginLog.create({user: user.id, ipAddress: ipAddress, status: 1});
                    //
                    //                 return res.json({
                    //                     message: "Login Successful!",
                    //                     data: Object.assign(apiToken.toObject(), user.toObject())
                    //                 });
                    //             })
                    //             .catch(err => {
                    //                 throw err;
                    //             });
                    //     }
                    // );
                }
            })
            .catch(e => {
                console.log(e);
                res.status(500).json({message: "Some error occured!"});
            });
    }
}
