import { expect } from 'chai';
import { describe } from 'mocha';

import UserInstruments from '../src/controller/user/user-instruments';
import Database from '../src/lib/db';
import config from '../config/server.config.json';

/**
 * test database
 */
describe("Database", function () {
    describe("Instance", function () {
        it("Should not return undefined when instantiaed with correct config", function () {
            const correctDB = new Database(config.db).getInstance()
            expect(correctDB).to.not.be.undefined
        })
        it("Should return the same instance everytime", function () {
            const mockDB = new Database(config.db).getInstance()
            const mockDB2 = new Database(config.db).getInstance()
            expect(mockDB).to.equals(mockDB2)
        })
    })
    describe("Postgres Connection", function () {
        it("Should execute query withtout error", async function () {
            const db = new Database(config.db).getInstance()
            const { rows } = await db.query('SELECT * FROM user_mitrais LIMIT 1')
            expect(rows).to.not.null
        })
    })
})

/**
 * test user instruments functions
 */
describe("User Instruments", function () {
    describe("Instantiation", function () {
        /**
         * do defense on each function not on constructor
         */
        it("Should proceed without error when instantiating without passing object to construtor", function () {
            expect(() => { new UserInstruments() }).to.not.throw()
        })
    })
    describe("Queries", function () {
        const MOCK_CORRECT_INPUT = {
            no_hp: '0898522313131',
            first_name: 'Achmad',
            last_name: 'Naufal',
            email: 'naufal@naufal.com',
        }

        const MOCK_INCORRECT_INPUT = {
            no_hp: '0898522313131',
            first_name: 'Achmad',
            last_name: 'Naufal',
        }
        this.afterAll(async function () {
            /**
             * delete mock data
             * after finishing test
             */
            const db = new Database(config.db).getInstance()
            await db.query("DELETE FROM user_mitrais WHERE no_hp =$1", [MOCK_CORRECT_INPUT.no_hp])
        })
        const userIns = new UserInstruments(MOCK_CORRECT_INPUT)
        describe("Standerized Input", function () {
            it("Should return correct data", function () {
                expect(userIns.standerizedInput(MOCK_CORRECT_INPUT).no_hp).to.be.equal(`62${MOCK_CORRECT_INPUT.no_hp.substr(2)}`)
            })
        })
        describe("Insert User", function () {
            it("Should throw error when trying to insert incorrect input", function () {
                expect(async () => {
                    const userInsIncorrect = new UserInstruments(MOCK_INCORRECT_INPUT)
                    await userInsIncorrect.insertUser()
                }).to.throw
            })
            it("Should insert user without error", async function () {
                const { rowCount } = await userIns.insertUser()
                expect(rowCount).to.equals(1)
            })
        })
        describe("Existing User", function () {
            it("Should return 1 when inserting user with existing no_hp", async function () {
                const foundUser = await userIns.isPhoneNumberExist()
                expect(foundUser.length).to.equals(1)
            })
            it("Should return 1 when inserting user with existing email", async function () {
                const foundUser = await userIns.isEmailExist()
                expect(foundUser.length).to.equals(1)
            })
        })
    })
})