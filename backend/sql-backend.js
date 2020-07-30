//import customers from './customers.JSON';

var mysql = require('mysql');

export default class SqlBackend{
    //Set up SQL connection
    constructor(dbConfig){

        let dbExists = (dbConfig.database)? true : false;

        if(dbExists) //Database already exists
        {
            this.con = mysql.createConnection({
                host: dbConfig.host,
                user: dbConfig.user,
                password: dbConfig.password,
                database: dbConfig.database
            });
        }
        else //Create DB and tables 
        {
            this.con = mysql.createConnection({
                host: dbConfig.host,
                user: dbConfig.user,
                password: dbConfig.password
            });
        }
        

        this.con.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");

            //If DB does not exist yet, create it
            if(!dbExists)
            {
                this.con.query("CREATE DATABASE btcdb", function (err, result) {
                    if (err) throw err;
                    console.log("btcdb created");

                    //Create customers table 
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
                            }); //end add customer query
                        }); //end foreach customer
                    }); //end create customers table


                    //Create Tx's table 
                    var sql = "CREATE TABLE transactions (name VARCHAR(255), address VARCHAR(255))";
                    this.con.query(sql, function (err, result) {
                        if (err) throw err;
                        console.log("Transactions table created");
                        //Fill in transactions data from given JSON files
                    }); //end create tx table

                }); //end create DB
            } //end if !dbExists   

        }); //end con.connect
        
    } //end constructor

} //end class Backend



