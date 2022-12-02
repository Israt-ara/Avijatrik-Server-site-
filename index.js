const express = require('express')
const cors = require("cors")
const jwt = require('jsonwebtoken')

const { MongoClient, ServerApiVersion, MongoRuntimeError, ObjectId } = require('mongodb');

require('dotenv').config();
const app = express()

//port declare
const port = process.env.PORT || 5000;


//middleware
app.use(cors())
app.use(express.json())




//mongodb part
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xfbrdjn.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// function verifyJWT(req, res, next) {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//         return res.status(401).send({ message: 'unauthorized access' })
//     }
//     const token = authHeader.split(' ')[1];

//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
//         if (err) {
//             return res.status(401).send({ message: 'unauthorized access' })
//         }
//         req.decoded = decoded;
//         next()

//     })
// }



function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}
















async function run() {

    try {
        const serviceCollection = client.db('avijatrik').collection('services');
        const reviewCollection = client.db('avijatrik').collection('reviews');


        //limited data for home page
        app.get('/homedata', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query)
            const services = await cursor.limit(3).toArray();
            res.send(services)
        })

        //jwt token access
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ token })
        })


        //crud read operation for all the data
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query).sort({ time: -1 })
            const services = await cursor.toArray();
            res.send(services)
        })
        //crud read operation for specific data
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query);
            res.send(service)
        })



        //crud operation for create new service
        app.post('/services', async (req, res) => {

            const service = req.body;
            console.log(service)
            const result = await serviceCollection.insertOne(service);
            res.send(result)

        })



        app.get('/reviews', async (req, res) => {


            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query).sort({ time: -1 });
            const reviews = await cursor.toArray();
            res.send(reviews);
        });












        app.get('/reviews/:id', async (req, res) => {
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews)
        })

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });

        app.patch('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body.status
            const query = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    status: status
                }
            }
            const result = await reviewCollection.updateOne(query, updatedDoc);
            res.send(result);
        })

        //crud delete
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })

    }

    finally {

    }




}

run().catch(err => console.error(err))






app.get('/', (req, res) => {
    res.send('my project is running')
})

app.listen(port, () => {
    console.log(`my project is running on ${port}`)
})

