# AdmitOne

The app is made of 2 parts.

  - A rest API to create, cancel and exchange tickets
  - An admin area to view events tickets

### Dependencies

This app requires:

* [Node.js](https://nodejs.org/) version 6+
* [npm](https://www.npmjs.com/) version 3+
* [Mongodb](https://docs.mongodb.com/manual/installation/) version 2.6+

*Warning: Tested only on ubuntu, but should work on other systems*

### Installation

Clone this repo

```sh
git clone git@github.com:diokey/admitOne.git
```

Install the dependencies and start the server.

```sh
$ cd admitOne
$ npm install
$ npm run dev
```
This will populate the database with sample data, and watch for file change

For production environments, run

```sh
$ npm run start
```

### Tests

To run tests
```sh
$ npm run test
```

### API examples

- **Purchase**
    To make a purchase send a POST request to /api/orders

    For example if Customer2 wants to purchase 3 tickets from event 4, you would do
    ```sh
    curl -X POST -H "Content-Type: application/json" -H "Cache-Control: no-cache" -d '{
	    "username": "customer2",
	    "eventId": 4,
	    "nbTickets": 3
    }' "http://localhost:9000/api/orders"
    ```
- **Cancelation**
    To cancel tickets, send a PATCH request to /api/orders/${orderId}

    For example
    ```sh
    curl -X PATCH -H "Content-Type: application/json" -H "Cache-Control: no-cache" -H -d '{
	    "username": "customer2",
	    "eventId": 4,
	    "nbTickets": 1
    }' "http://localhost:9000/api/orders/5844836bf7115a720111a217"
    ```
- **Exchange**
    To exchange tickets, make a PUT request to /api/orders/${orderId}
    You have to specify the origin event id and the destination event id

    In the example below, exchange 2 tickets from event 1 to event 2.
    ```sh
    curl -X PUT -H "Content-Type: application/json" -H "Cache-Control: no-cache" -d '{
	    "username": "customer2",
	    "originEventId": 1,
	    "destEventId": 2,
	    "nbTickets": 2
    }' "http://localhost:9000/api/orders/584485f6f7115a720111a219"
    ```

#### Admin login

Go to [http://localhost:9000]()

You can use **test1:password123** to log into the admin side in dev mode

