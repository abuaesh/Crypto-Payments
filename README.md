# Crypto/Payments Credit Updating App

## Description
This is a dockerized Node.js application to process bitcoin transaction sets and save the data to a Mongo Database(A Mongo cluster is used here, but it can be changed according to the associated .env file). 

## Background
Part of maintaining users credit amounts in their e-wallet, it is required to filter deposits that were made to their account on the bitcoin network. Thousands of deposits are made customers everyday. In this app, a transaction set returned by a blockchain daemon, like bitcoind, is filtered for deposits made for registered customers.

The data we work with in this scenario comes from bitcoind’s rpc call `listsinceblock`. A frequently used approach to detect incoming deposits is to periodically call `listsinceblock` and process the returned data. These calls to the endpoint(a bitcoin node) have been previously made and the data is saved in 2 json files that represent the data from 2 separate calls to this endpoint.  The app in this repo processes those files and detects all valid incoming deposits.

The results returned by this app will determine how much money each customer will get. A verification process is hence made per each transaction to ensure it is not a duplicate, confirmed at least 6 times on the blockchain, does not conflict with previous transactions for this wallet.

**Goal**: Process transactions and filter them for valid deposits.

**Note**: A deposit is considered valid when it has at least 6 confirmations.

Known customer addresses are:
* Wesley Crusher: mvd6qFeVkqH6MNAS2Y2cLifbdaX5XUkbZJ
* Leonard McCoy: mmFFG4jqAtw9MoCC88hw5FNfreQWuEHADp
* Jonathan Archer: mzzg8fvHXydKs8j9D2a8t7KpSXpGgAnk4n
* Jadzia Dax: 2N1SP7r92ZZJvYKG2oNtzPwYnzw62up7mTo
* Montgomery Scott: mutrAf4usv3HKNdpLwVD4ow2oLArL6Rez8
* James T. Kirk: miTHhiX3iFhVnAEecLjybxvV5g8mKYTtnM
* Spock: mvcyJMiAcSXKAEsQxbW9TYZ369rsMG6rVV

## Usage

The command `docker-compose up` does the following:

1. Read all transactions from `transactions-1.json` and `transactions-2.json` and store all deposits in a MongoDB database.
2. Read deposits from the database that are good to credit to users and print the following lines on stdout:

    ```
    Deposited for Wesley Crusher: count=n sum=x.xxxxxxxx
    Deposited for Leonard McCoy: count=n sum=x.xxxxxxxx
    Deposited for Jonathan Archer: count=n sum=x.xxxxxxxx
    Deposited for Jadzia Dax: count=n sum=x.xxxxxxxx
    Deposited for Montgomery Scott: count=n sum=x.xxxxxxxx
    Deposited for James T. Kirk: count=n sum=x.xxxxxxxx
    Deposited for Spock: count=n sum=x.xxxxxxxx
    Deposited without reference: count=n sum=x.xxxxxxxx
    Smallest valid deposit: x.xxxxxxxx
    Largest valid deposit: x.xxxxxxxx
    ```

    The numbers in lines 1 - 7 contain the count of valid deposits and their sum for the respective customer.
    
    The numbers in line 8 are be the count and the sum of the valid deposits to addresses that are not associated with a known customer.

## How to run it?
First, you need to include a .env file pointing to your DB variables:

    MONGO_CONNECTION_STRING=***
    MONGO_PASSWORD=***
    MONGO_DB_NAME=***
    TX_COLLECTION_NAME=***
    CUSTOMER_COLLECTION_NAME=***
Then, you can run the image by following these steps in a terminal:
`npm init`
`npm install`
`node app.js`
Or, alternatively, you can run the docker container by: `docker-compose up`



## Explanation and Resources


### Understanding the Input files (transactions.json)
There are 2 input files. They are the returned results(list of transactions in JSON format) from running bitcoind’s rpc call `listsinceblock`. The app processes those files and detects all valid incoming deposits.

#### listsinceblock ( "blockhash" target_confirmations include_watchonly include_removed )
Gets all transactions in blocks since block [blockhash], or all transactions if omitted. If “blockhash” is no longer a part of the main chain, transactions from the fork point onward are included. Additionally, if include_removed is set, transactions affecting the wallet which were removed are returned in the “removed” array.
More: https://bitcoin-rpc.github.io/en/doc/0.17.99/rpc/wallet/listsinceblock/

**What is a Watch Only Address?**
A watch only address lets you watch a bitcoin wallet owned by someone else. They can move their bitcoins away at any time. You cannot spend their bitcoins.

**What is BIP125?**
Transaction replaceability occurs when a full node allows one or more of the transactions in its memory pool (mempool) to be replaced with a different transaction that spends some or all of the same inputs.
Many nodes today will not replace any transaction in their mempool with another transaction that spends the same inputs, making it difficult for spenders to adjust their previously-sent transactions to deal with unexpected confirmation delays or to perform other useful replacements. The opt-in full Replace-by-Fee (opt-in full-RBF) signaling policy allows spenders to add a signal to a transaction indicating that they want to be able to replace that transaction in the future.
More: https://en.bitcoin.it/wiki/Transaction_replacement 

**How to check if a bitcoin tx is valid?**
https://en.bitcoin.it/wiki/Protocol_rules#.22tx.22_messages 
https://bitcoin.stackexchange.com/questions/22997/how-is-a-wallets-balance-computed/23034#23034 

