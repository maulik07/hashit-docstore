import { Router, Request, Response } from 'express'
import * as passport from 'passport'

const router: Router = Router()

router.get('/auth/google-drive', passport.authenticate('google-drive',
    {scope: `https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.photos.readonly https://www.googleapis.com/auth/drive.readonly`
    }))

router.get('/auth/google-drive/callback',
    passport.authenticate('google-drive', { scope: 'https://www.googleapis.com/auth/drive',
     failureRedirect: '/fail' }),
    function (req, res) {
        req.session.token = req.user.token
        console.log(req.session.token)
        res.redirect('/success');
    });

export const GoogleDriveAuthController : Router = router;    