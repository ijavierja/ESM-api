import express from 'express'

const apiRouter = express.Router();

apiRouter.get('/', (_, res) => {
    res.json({
        'API version' : 'v1'
    })
})

export default apiRouter;