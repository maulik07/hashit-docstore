import { Router, Request, Response} from 'express'

const router : Router = Router();

router.get('/', (req: Request, res: Response) => {
    res.send({
        message: "Hey! I'm awake :)"
    })
})

router.get('/logout', (req, res) => {
    req.logout()
    res.send({
        message: "Tchau!!"
    })
})

export const WelcomeController : Router = router;