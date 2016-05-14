var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var Product    = require('./models/product');

var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost/rest-api');

// configure app to use bodyParser()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

var router = express.Router();              // get an instance of the express Router

router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

router.route('/products')
    .post(function(req,res){
        var product = new Product();
        product.name = req.body.name;
        product.size = req.body.size;
        product.color = req.body.color;
        product.price = req.body.price;
        console.log("body name is " + product.name);
        product.save(function(err){
            if(err) {
                console.log("error is observed");
                res.send(err);
            }
            
        });
        res.json({ message: "product created"});
        console.log("after saving the  product");
    })
    
    .get(function(req,res){
        Product.find(function(err, products){
            if(err) {
                res.send(err);
            }
            console.log("before sending products");
            res.json(products);
        })
    });

router.route('/product')
    .post(function(req,res){
        var product = new Product();
        product.name = req.body.name;
        product.size = req.body.size;
        product.color = req.body.color;
        product.price = req.body.price;
        console.log("before saving the product");
        product.save(function(err){
            if(err) {
                console.log("error is observed");
                res.send(err);
            }
            res.json({ message: "product created"});
        });
        console.log("after saving the  product");   
    })
    
    .get(function(req,res){
        
    });

// all of routes will be prefixed with /api
app.use('/api', router);

app.listen(port);