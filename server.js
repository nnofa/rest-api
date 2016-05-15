var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var Product    = require('./models/product');
var Category   = require('./models/category');

var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost/rest-api');

// configure app to use bodyParser()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

var router = express.Router();              // get an instance of the express Router

const noProductFound = "No product with specified ID can be found";

function InitializeFilter(colorFilter, sizeFilter, priceMinFilter, priceMaxFilter){
    var ret ={};
    //TIL this is almost the same as checking if a value is null or undefined
    if(colorFilter != null && colorFilter.length > 0){
        ret.color = colorFilter;
    }
    if(sizeFilter != null && sizeFilter.length > 0){
        ret.size = sizeFilter;    
    }
    
    if(priceMinFilter != null && priceMinFilter.length > 0){
        ret.price = {};
        ret.price.$gt = priceMinFilter;  
    }
    
    if(priceMaxFilter != null && priceMaxFilter.length > 0){
        if(ret.price == null){
            ret.price = {};
        }
        
        ret.price.$lt = priceMaxFilter
    }
    
    return ret;
}

router.route('/products')
    .get(function(req,res){
        var colorFilter = req.body.color;
        var sizeFilter = req.body.size;
        var priceMinFilter = req.body.priceMin;
        var priceMaxFilter = req.body.priceMax;
        var filter = InitializeFilter()
        
        
        Product.find(function(err, products){
            if(err) {
                res.send(err);
            }
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
        product.category = req.body.category;
        product.save(function(err, newproduct){
            if(err) {
                res.send(err);
            }
            res.json({ message: "product created", product:newproduct});
        });
    });
    
router.route('/product/:id')
    // retrieve a product given product id 
    .get(function(req,res){
        var id = req.params.id;
        Product.findOne({_id: id}, function(err, product){
            if(!err){
                if(product === null){
                    res.json({message: noProductFound});
                } else{
                    res.json({product: product, message: "successfully found"});
                }
            } else{
                err.message = noProductFound;
                res.send(err);
            }
        });
    })
    
    // update a product given product id
    .put(function(req,res){
        //unneeded for the assessment
    })
    
    // delete a product given product id
    .delete(function(req,res){
        var id = req.params.id;
        Product.remove({_id: id}, function(err, numRemoved){
           if(!err && numRemoved > 0){
               res.json({message: "successfully deleted product " + id});
           } else if(!err){
               res.josn({message: noProductFound});  
           } else{
               res.json({message: "error on deletion"});
           }
        });
    })

// all of routes will be prefixed with /api
app.use('/api', router);

app.listen(port);