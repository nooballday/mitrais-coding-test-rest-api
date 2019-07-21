import UserInstrument from './user-instruments';

export default async function (req, res) {
    const userIns = new UserInstrument(req.body)
    try {
        const userFoundByPhone = await userIns.isPhoneNumberExist()
        const userFoundByEmail = await userIns.isEmailExist()
        if (userFoundByPhone[0].count > 0) {
            return res.status(422).send({
                error: 'Phone Number Already Registered'
            })
        }
        if (userFoundByEmail[0].count > 0) {
            return res.status(422).send({
                error: 'Email Already Registerd'
            })
        }

        /**
         * do insert to database
         */
        const { rowCount: userInserted } = await userIns.insertUser();
        if (userInserted === 1) {
            res.send({
                status: true,
                message: 'success inserting user!'
            })
        } else {
            throw new Error('More than 1 users are inserted Error[14]')
        }
    } catch (error) {
        /**
         * send to crashlytics or any other log management
         */
        console.error(`[x] ${new Date()} Error at : register-user`, error.stack)
        res.send({
            status: false,
            error: error.message
        })
    }
}