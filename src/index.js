import config from '../config/server.config.json';
import registerController from './controller/user/register-user';
import bodyParser from 'body-parser';
import express from 'express';

class App {
    constructor(appConfig) {
        this.config = appConfig.server
        this.app = express()
        console.info(`Server is starting at ${new Date()} in port : ${this.config.port}`)
    }

    route() {
        const router = express.Router()
        router.post('/user', registerController)
        return router
    }

    main() {
        /**
         * accept all
         * in preflight request
         * for the sake of simplicity
         */
        this.app.use(function (_, res, next) {
            res.header("Access-Control-Allow-Origin", "*")
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
            next()
        })
        this.app.use(bodyParser.urlencoded({ extended: false }))
        this.app.use('/api/', this.route())
        this.app.listen(this.config.port)
    }
}

new App(config).main()