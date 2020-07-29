import Transactions1 from './transactions-1.json.json';
import Transactions2 from './transactions-2.json.json';
import DB from './backend.js';

(async() => {

    let dbConfig = {
        host: 'localhost',
        user: 'abuaesh',
        password: 'abc123',
        database: 'btcdb'
    };

    let backend = new Backend(dbConfig, () => {

    }); //end backend
})(); //end async