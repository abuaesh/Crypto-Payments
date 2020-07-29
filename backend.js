var mysql = require('mysql');

export default class Backend{
    //Set up SQL connection
    constructor(dbConfig){

        let con = mysql.createConnection({
            host: dbConfig.host? dbConfig.host : 'localhost',
            user: dbConfig.user? dbConfig.user : 'abuaesh',
            password: dbConfig.password? dbConfig.password : 'abc123',
            database: dbConfig.database? dbConfig.database : 'btcdb'
        });

        con.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");

            //If DB does not exist yet, create it
            if(???)
            {
                con.query("CREATE DATABASE btcdb", function (err, result) {
                    if (err) throw err;
                    console.log("btcdb created");
                });
            }

            //If Tx table does not exist yet, create it
            if(???)
            {
                var sql = "CREATE TABLE transactions (name VARCHAR(255), address VARCHAR(255))";
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("Table created");
                });
            }
                
        });
    } 

}



