import * as express from 'express'
import * as passport from 'passport'
import * as util from 'util'
import { Strategy as GoogleDriveStrategy } from 'passport-google-drive'
import { Strategy as GooglePlusStrategy } from 'passport-google-oauth2'
import * as dotenv from 'dotenv'

class App {
    public express

    constructor() {
        dotenv.config()
        this.initPassportGoogleDriveStrategy()
        this.initPassportGooglePlusStrategy()
        this.express = express()
        this.mountRoutes()
    }

    private initPassportGooglePlusStrategy(): void {
        passport.serializeUser(function (user, done) {
            done(null, user);
        });

        passport.deserializeUser(function (obj, done) {
            done(null, obj);
        });

        passport.use(new GooglePlusStrategy({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google/callback",
            passReqToCallback: true
        },
            function (accessToken, refreshToken, profile, done) {
                // asynchronous verification, for effect...
                process.nextTick(function () {
                    return done(null, profile);
                });
            }))
    }

    private initPassportGoogleDriveStrategy() {
        passport.serializeUser(function (user, done) {
            done(null, user);
        });

        passport.deserializeUser(function (obj, done) {
            done(null, obj);
        });

        passport.use(new GoogleDriveStrategy({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google-drive/callback"
        },
            function (accessToken, refreshToken, profile, done) {
                // asynchronous verification, for effect...
                process.nextTick(function () {

                    // To keep the example simple, the user's Google profile is returned to
                    // represent the logged-in user.  In a typical application, you would want
                    // to associate the Google account with a user record in your database,
                    // and return that user instead.
                    return done(null, profile);
                });
            }
        ));

    }

    private mountRoutes(): void {
        const router = express.Router()
        router.get('/', (req, res) => {
            res.json({
                message: 'Hello World!'
            })
        })
        router.get('/fail', (req, res) => {
            res.json({
                message: 'Fail'
            })
        })
        router.get('/', (req, res) => {
            res.json({
                message: 'Success'
            })
        })

        router.get('/auth/google',
            passport.authenticate('google', {
                scope:
                    ['https://www.googleapis.com/auth/plus.login',
                        'https://www.googleapis.com/auth/plus.profile.emails.read']
            }
            ));

        router.get('/auth/google/callback',
            passport.authenticate('google', {
                successRedirect: '/success',
                failureRedirect: '/fail'
            }));

        router.get('/auth/google-drive',
            passport.authenticate('google-drive', { scope: 'https://www.googleapis.com/auth/drive' }),
            function (req, res) {
                // The request will be redirected to Google for authentication, so this
                // function will not be called.
            });

        // GET /auth/google-drive/callback
        //   Use passport.authenticate() as route middleware to authenticate the
        //   request.  If authentication fails, the user will be redirected back to the
        //   login page.  Otherwise, the primary route function function will be called,
        //   which, in this example, will redirect the user to the home page.
        router.get('/auth/google-drive/callback',
            passport.authenticate('google-drive', { scope: 'https://www.googleapis.com/auth/drive', failureRedirect: '/fail' }),
            function (req, res) {
                res.redirect('/success');
            });
        this.express.use('/', router)
    }
}

export default new App().express