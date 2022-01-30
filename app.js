const express = require("express");
const app = express();


const port = process.env.PORT || 5000;
const mongoose = require("mongoose");

const multer = require("multer");
const productModel = require("./model/product");
const fs = require('fs');
const session = require('express-session');
mongoose.connect("mongodb+srv://texo:VUskF7Aywniidhpo@tex.yf5rb.mongodb.net/test", { useNewUrlParser: true }).then(() => console.log('mongo connected')).catch(err => console.log(err));
app.use(session({
    secret: "my secret key",
    saveUninitialized: true,
    resave: false
}));

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const { v4: uuidv4 } = require('uuid');

app.use(express.static("./public"));
app.set("views", __dirname + "/src/views");

// app.get('/products', (req, res) => {
    
//     res.send("productpages");
// });
app.get("/products", function (req, res) {
    productModel.find()
        .then(function (items) {
            res.render("products", {
                items
            });
        });
});
// product single page
app.get("/products/single/:id", function (req, res) {
    const i = req.params.id;

    productModel.findOne({ _id: i })
        .then(function (item) {
            res.render("single", {
                item
            })
    })
}); 


// adding employ
app.get("/products/post", function (req, res) {
    res.render("addingproducts");
});

// multer
var fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '--' + file.originalname);
    },
});
var imageupload = multer({ storage: fileStorageEngine });


//product posting
app.post('/products/post', imageupload.single('image'), function (req, res) {
    // const uniqueString = uuidv4() + _id;
    const uniqueString = uuidv4();
    var items = {

        title: req.body.title,

        uniqueids: req.body.uniqueids,

        uniqueString,

        image: req.file.filename
    }
    
        var saveproductdata = productModel(items);
        saveproductdata.save((err, success) => {
            if (err) {
                res.json({ message: err.message, type: 'danger' })
           console.log(err, "error adding student");
            } else {
                req.session.message = {
                    type: 'success',
                    message: 'products added successfully'
                }
               
                console.log(success, "products added successfully");
                res.redirect('/products')
        }
    });
})

// getting update page
app.get("/products/updating/:id", function (req, res) {
    let id = req.params.id;
    productModel.findById(id, (err, items) => {
        if (err) {
            res.redirect('/products')
        } else {
            res.render("updatingproducts", {
                items
            });
        }
    });
});
// updating product
app.post('/products/updating/:id', imageupload.single('image'), (req,res)=>{
    console.log(req.body);
    let id = req.params.id;
    let new_image = "";
        if (req.file){
            new_image = req.file.filename;
            try {
             fs.unlink('./public/images/'+ req.body.old_image)
            } catch (err) {
                console.log(err)
            }
        } else {
            new_image = req.body.old_image;
        }
    productModel.findByIdAndUpdate(id, {

        title: req.body.title,
        uniqueids: req.body.uniqueids,


        // uniqueString,
        image: new_image,

    }, (err, result) => {
        if (err) {
            res.json({ message: err.message, type: 'danger' })
            console.log(err, "error updating products");
        } else {
            req.session.message = {
                type: 'success',
                message: 'products updates successfully'
            }
            console.log(result, "products updates successfully");
            res.redirect('/products')
        }
   })
 })
//product deleting
app.get('/product/delete/:id',(req,res)=>{
     
    id = req.params.id;
    productModel.findByIdAndDelete( id, (err, result) => {
        if (result.image != '') {
            try {
             fs.unlink("./public/images/" + result.image)
            } catch (err) {
                console.log(err)
            }
        };
        if (err) {
            res.json({ message: err.message })
        } else {
            req.session.message = {
                type: 'info',
                message: 'products deleted successfully'
            };
            res.redirect('/products')
        } 
    })
  })





app.listen(port, () => {
    console.log(`app listening at ${port}`);
});