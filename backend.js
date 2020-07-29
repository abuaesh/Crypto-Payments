import customers from './customers.JSON';

var mysql = require('mysql');

export default class Backend{
    //Set up SQL connection
    constructor(dbConfig){

        this.con = mysql.createConnection({
            host: dbConfig.host? dbConfig.host : 'localhost',
            user: dbConfig.user? dbConfig.user : 'abuaesh',
            password: dbConfig.password? dbConfig.password : 'abc123',
            database: dbConfig.database? dbConfig.database : 'btcdb'
        });

        this.con.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");

            //If DB does not exist yet, create it
            if(???)
            {
                this.con.query("CREATE DATABASE btcdb", function (err, result) {
                    if (err) throw err;
                    console.log("btcdb created");
                });
            }

            //If customers table does not exist yet, create it
            if(???)
            {
                var sql = "CREATE TABLE customers (name VARCHAR(255), address VARCHAR(255))";
                this.con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("Customers table created");
                    //Fill in customers data
                    customers.forEach(customer => {
                        var sql = "INSERT INTO customers (name, address) VALUES ('" 
                                + customer.name + "', '" + customer.address + "')";
                        con.query(sql, function (err, result) {
                            if (err) throw err;
                            console.log("1 record inserted");
                        });

                    }
                });
            }

            //If Tx table does not exist yet, create it
            if(???)
            {
                var sql = "CREATE TABLE transactions (name VARCHAR(255), address VARCHAR(255))";
                this.con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("Transactions table created");
                    //Fill in transactions data from given JSON files
                });
            }
                
        });
    } 

}



