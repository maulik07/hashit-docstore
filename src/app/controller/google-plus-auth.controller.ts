import { Router, Request, Response } from 'express'
import * as passport from 'passport'

const router: Router = Router()

router.get('/auth/google',
passport.authenticate('google', {
    scope:
        ['https://www.googleapis.com/auth/plus.login',
            'https://www.googleapis.com/auth/plus.profile.emails.read']
}
));

router.get('/auth/google/callback',
passport.authenticate('google', {
    failureRedirect: '/fail'
}), function(req: any, res) {
    req.session.token = req.user.token
    res.redirect('/success')
});

export const GooglePlusAuthController: Router = router