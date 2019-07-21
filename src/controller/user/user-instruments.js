import Database from '../../lib/db';
import config from '../../../config/server.config.json';
import Joi from 'joi'
import Utils from '../../lib/utils';

export default class UserInstrument {
    constructor(userData) {
        this.db = new Database(config.db).getInstance()
        this.userData = userData
    }

    standerizedInput(userData) {
        const modifiedUserData = userData
        modifiedUserData.no_hp = UserInstrument.standerizedIndonesianPhoneNumber(userData.no_hp)
        modifiedUserData.id = Utils.getUUID()
        return modifiedUserData
    }

    static standerizedIndonesianPhoneNumber(phoneNumber) {
        let mPhoneNumber = phoneNumber
        if (phoneNumber.substr(0, 1) == '0') {
            mPhoneNumber = `62${phoneNumber.substr(1)}`
        } else if (phoneNumber.substr(0, 2) !== '62') {
            throw new TypeError('IllegalPhoneNumberFormat')
        }
        return mPhoneNumber
    }

    validateBeforeInput() {
        /**
         * check fot the input first
         */
        if (typeof this.userData !== 'object') {
            throw new Error(`UserInstruments require an object, found : ${typeof this.userData}`)
        }

        const userDataSchema = Joi.object().keys({
            id: Joi.string().required().length(32),
            no_hp: Joi.string().required(),
            first_name: Joi.string().required(),
            last_name: Joi.string().required(),
            email: Joi.string().required().regex(/\S+@\S+\.\S+/),
            gender: Joi.allow(null),
            date_of_birth: Joi.allow(null)
        })

        const { error: validateUserDataError } = userDataSchema.validate(this.userData)

        if (validateUserDataError) {
            throw new Error(`${validateUserDataError.message} Error[13]`)
        }

        return true
    }

    async insertUser() {
        this.userData = this.standerizedInput(this.userData)
        this.validateBeforeInput()
        return this.db.query('INSERT INTO user_mitrais(id, no_hp, first_name, last_name, date_of_birth, email, gender) VALUES($1, $2, $3, $4, $5, $6, $7)', [
            this.userData.id,
            this.userData.no_hp,
            this.userData.first_name,
            this.userData.last_name,
            this.userData.date_of_birth === '' ? null : this.userData.date_of_birth,
            this.userData.email,
            this.userData.gender === '' ? null : this.userData.gender
        ])
    }

    async isEmailExist() {
        if (!this.userData.email) {
            throw new Error('Please provide an email Error[13]')
        }
        const { rows: userRegistered } = await this.db.query('SELECT COUNT(*) FROM user_mitrais WHERE email = $1', [
            this.userData.email
        ])
        return userRegistered
    }

    async isPhoneNumberExist() {
        if (!this.userData.no_hp) {
            throw new Error('Please provide a phone_number Error[13]')
        }
        const { rows: userRegistered } = await this.db.query('SELECT COUNT(*) FROM user_mitrais WHERE no_hp = $1', [
            this.userData.no_hp
        ])
        return userRegistered
    }
}