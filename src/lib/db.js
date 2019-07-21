import { Pool } from 'pg';
import Joi from 'joi';

/**
 * make sure this class only return a singleton
 */
export default class Database {

    constructor(dbconfig) {
        this.dbconfig = dbconfig
        if (Database.instance) {
            return Database.instance
        }
        Database.instance = this
        this.createInstance()
        return this
    }

    checkConfig() {
        const dbConfig = this.dbconfig
        if (typeof dbConfig != 'object') {
            throw new Error(`Expected object, Found ${typeof dbConfig}`)
        }
        const dbConfigSchema = Joi.object().keys({
            host: Joi.string().required(),
            database: Joi.string().required(),
            user: Joi.string().required(),
            password: Joi.string().required(),
            port: Joi.number().required()
        })
        const { error } = dbConfigSchema.validate(dbConfig)
        if (error) {
            throw new Error(`Database config missing paramters, check server.config.json, message : ${error.message}`)
        }
        return true
    }

    createInstance() {
        if (this.checkConfig()) {
            this.pool = new Pool(this.dbconfig)
        }
    }

    getInstance() {
        return this.pool
    }
}