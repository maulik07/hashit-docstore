import * as express from 'express'
import * as passport from 'passport'
import * as util from 'util'
import { Strategy as GoogleDriveStrategy } from 'passport-google-drive'
import { Strategy as GooglePlusStrategy } from 'passport-google-oauth2'
import * as dotenv from 'dotenv'
import * as session from 'express-session'

// Import controllers
import { WelcomeController } from './controller/welcome.controller'
import { GoogleDriveAuthController } from './controller/google-drive-auth.controller'
import { GooglePlusAuthController } from './controller/google-plus-auth.controller'

class App {
    public express : express.Application
    
    private routeMap : Map<any, express.Router[]> = new Map<any, express.Router[]>([
        ['/', [WelcomeController, GoogleDriveAuthController, GooglePlusAuthController]]        
    ])

    constructor() {
        dotenv.config()        
        this.express = express()
        this.initPassportGoogleDriveStrategy()
        this.initPassportGooglePlusStrategy()        
        this.setupSession()
        this.mountRoutes()
    }

    private setupSession() {
        this.express.use(session({secret:'mys3cr3TKey', resave: false, saveUninitialized: false}))
        this.express.use(passport.initialize())        
        this.express.use(passport.session())
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
            callbackURL: "http://localhost:3000/auth/google/callback"
        },(accessToken, refreshToken, profile, done) =>
         this.googleVerifyCallback(accessToken, refreshToken, profile, done)
        ))
    }

    private googleVerifyCallback(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
            console.log("Token is ");
            console.log(util.inspect(accessToken, false, null, true));
            done(null, {profile: profile, token: accessToken});
        });
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
        (accessToken, refreshToken, profile, done) =>
        this.googleVerifyCallback(accessToken, refreshToken, profile, done)
       ))
    }

    private checkAuthentication(req,res,next){
        if(req.isAuthenticated()){
            next();
        } else{
            res.redirect("/auth/google");
        }
    }

    private mountRoutes(): void {
        const router = express.Router()

        this.express.use('/secure*', this.checkAuthentication);
        
        this.routeMap.forEach((router: express.Router[], path: any) => {            
            this.express.use(path, router);
        })

        router.get('/secure', (req, res) => {
            res.json({
                message: 'This is our secret'
            })
        })

        router.get('/secure/another', (req, res) => {
            res.json({
                message: 'This is our secret'
            })
        })
        
        router.get('/success', (req, res) => {            
            res.json({
                message: `Success Yo! ${req.session.token}`
            })
        })

        // GET /auth/google-drive/callback
        //   Use passport.authenticate() as route middleware to authenticate the
        //   request.  If authentication fails, the user will be redirected back to the
        //   login page.  Otherwise, the primary route function function will be called,
        //   which, in this example, will redirect the user to the home page.
        this.express.use('/', router)
    }
}

export default new App().express