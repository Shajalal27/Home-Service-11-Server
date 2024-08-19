const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000

const app = express()



//midleware
// const corsOptions ={
//     origin: ['http://localhost:5173', 'https://crud-and-jwt-operation.web.app',],
//     Credentials:true,
//     optionSuccessStatus: 200,

// }

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jisai8k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    
    const servicesCollection = client.db('HomeService').collection('populerService')
    const booksCollection = client.db('HomeService').collection('book')

  //auth related api
   app.post('/jwt', async(req, res) =>{
    const user = req.body;
    console.log(user)
    res.send(user)
   } )
   
    //get all service data from db
    app.get('/service', async(req, res) =>{
        const result = await servicesCollection.find().toArray()
        res.send(result)
    })

    app.get('/service/:id', async (req, res) =>{
        const id = req.params.id
        const query = {_id: new ObjectId(id)}
        // const options ={
        //       projection: {title: 1, price: 1, service_id: 1, img: 1}
        // };
        const result = await servicesCollection.findOne(query)
        res.send(result)
    })

    //booking
    app.get('/book', async (req, res) =>{
      console.log(req.query.email)
      let query = {};
      if(req.query?.email){
        query = {email: req.query.email}
      }
      const result = await booksCollection.find().toArray();
      res.send(result)
    })

    //save a book data 
    app.post('/books', async (req, res) =>{
      const bookData = req.body;
      const result = await booksCollection.insertOne(bookData)
      res.send(result)
    })

    //save a add data 
    app.post('/add', async (req, res) =>{
      const addData = req.body;
      const result = await servicesCollection.insertOne(addData)
      res.send(result)
    })

    app.put('/service/:id', async (req, res) =>{
      const id = req.params.id
      const filter = { _id: new ObjectId(id)}
      const updateData = req.body
      const options ={upsert: true}
      const updateDoc ={
          $set:{
            ...updateData,
          },
      };
      const result = await servicesCollection.updateOne(filter, updateDoc, options)
      res.send(result)
    })

    app.get('/book/:email', async (req, res) =>{
      const email = req.params.email
      const query = {email}
      const result = await booksCollection.find(query).toArray()
      res.send(result)
    })

    //get all booked service
    app.get('/booked/:email', async (req, res) =>{
      const email = req.params.email
      const query = {'service_provider.provider_email' : email}
      const result = await booksCollection.find(query).toArray()
      res.send(result)
    })

    //pagination
    app.get('services/', async (req, res) =>{
      const {page = 1, limit = 10, search = ''} = req.query;
      try{
        const services = await Service.find({
          serviceName:{$regex: search, $options: 'i'}
        })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

        const count = await Service.countDocuments({
          serviceName:{$regex: search, $options: 'i'}
        });
        res.json({
          services,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page)
        });
      } catch (error){
        res.status(5000).json({message: 'Error fetching servises'})
      }
    });

    app.delete('/service/:id', async (req, res) =>{
      const id = req.params.id
      const query ={_id: new ObjectId(id)}
      const result = await servicesCollection.deleteOne(query)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    
  }
}
run().catch(console.dir);



app.get('/', (req, res) =>{
    res.send('Hello from server is running')
})

app.listen(port, () => console.log(`Server runing on port ${port}`))
