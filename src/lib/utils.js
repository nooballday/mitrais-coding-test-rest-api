import uuid from 'uuid/v4';

export default class Utils {
    static getUUID() {
        return uuid().replace(/-/g, '')
    }
}