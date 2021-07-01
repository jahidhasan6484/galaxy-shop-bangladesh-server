const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const admin = require('firebase-admin');
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require('mongodb').ObjectID;

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.j3ujg.mongodb.net/${process.env.DB_Name}?retryWrites=true&w=majority`;

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("phone"));
app.use(fileUpload());

const serviceAccount = require("./ServiceAccount/galaxy-shop-bangladesh-firebase-adminsdk-3q1aj-7e853996a6.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const port = 4000;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const phoneCollection = client.db("galaxyShopBangladesh").collection("addPhone");

  //Add Phone
  app.post("/addAPhone", (req, res) => {
    const file = req.files.file;
    const category = req.body.category;
    const model = req.body.model;
    const previousPrice = req.body.previousPrice;
    const presentPrice = req.body.presentPrice;
    const productStatus = req.body.productStatus;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    phoneCollection
      .insertOne({ category, model, previousPrice,presentPrice, productStatus, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });



  // Get Phone
  app.get("/phone", (req, res) => {
    phoneCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });


});


app.listen(process.env.PORT || port);