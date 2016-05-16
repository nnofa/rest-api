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

function InitializeProductsFilter(colorFilter, sizeFilter, priceMinFilter, priceMaxFilter){
    var ret ={};
    //this is almost the same as checking if a value is null or undefined
    if(colorFilter != null && colorFilter.length > 0){
        ret.color = colorFilter;
    }
    if(sizeFilter != null && sizeFilter.length > 0){
        ret.size = sizeFilter;    
    }
    
    if(priceMinFilter != null && priceMinFilter.length > 0){
        ret.price = {};
        ret.price.$gte = priceMinFilter;  
    }
    
    if(priceMaxFilter != null && priceMaxFilter.length > 0){
        if(ret.price == null){
            ret.price = {};
        }
        
        ret.price.$lte = priceMaxFilter
    }
    
    return ret;
}

router.route('/products')
    .get(function(req,res){
        var colorFilter = req.query.color;
        var sizeFilter = req.query.size;
        console.log("size filter is" + sizeFilter);
        var priceMinFilter = req.query.priceMin;
        var priceMaxFilter = req.query.priceMax;
        //todo: add filter with category but not required for the assessment
        var filter = InitializeProductsFilter(colorFilter, sizeFilter, priceMinFilter, priceMaxFilter);
        
        Product.find(filter ,function(err, products){
            if(err) {
                res.send(err);
            } else{
                res.json({products: products});
            }
        })
    });

router.route('/product')
    .post(function(req,res){
        var product = new Product();
        product.name = req.body.name;
        product.size = req.body.size; // do conversion here if needed e.g: "XXS" into 0
        // current assumption, color is somehow converted by front-end stuff to be integer
        product.color = req.body.color; // do conversion here if needed e.g: "#FF0000" into Red/0, not done here because not enough time
        product.price = req.body.price;
        product.categories = req.body.categories;
        product.save(function(err, newproduct){
            if(err) {
                res.status(400).send(err);
            } else{
                res.json({ message: "product created", product:newproduct});
            }
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
               res.json({message: noProductFound});  
           } else{
               res.json({message: "error on deletion"});
           }
        });
    })

//categories 
router.route('/categories')
    .get(function(req,res){
        Category.find(function(err, categories){
            if(err) {
                res.send(err);
            } else{
                res.json(categories);
            }
        }) 
    });

// post a category, because how this is designed, parent categories must be created first
// before child categories
router.route('/category')
    .post(function(req,res){
        var name = req.body.name;
        var parentCategoryId = req.body.parentCategory;
        var category = new Category(); // new category
        category.name = name;
        category.active = true;
        if(parentCategoryId != null && parentCategoryId.toString().length > 0){
            Category.find({_id: parentCategoryId}, function(err, parentCategory){
                if(parentCategory != null){
                    category.parentCategory = parentCategoryId;
                    category.save(function(err, newcategory){
                        if(err) {
                            res.status(400).send(err);
                        } else{
                            res.json({ message: "category created", category: newcategory});
                            //update childCategories of parent, or parent of parent
                            Category.update({$or: [{_id: parentCategoryId}, {childCategories: parentCategoryId}]}, 
                                            {$addToSet: {childCategories: newcategory._id}}, false, true);
                        }   
                    });
                } else{
                    res.status(400).json({message: "Invalid parent category id"});
                }
            });
        } else{
            category.save(function(err, newcategory){
                if(err) {
                    res.status(400).send(err);
                } else{
                    res.json({ message: "category created", category: newcategory});
                }   
            });
        }
    })

router.route('/category/:id')
    .get(function(req, res){
        var id = req.params.id;
        Category.findOne({_id:id}, function(err, category){
            if(!err){
                if(category === null){
                    res.status(400).json({message: "No category with specific id found"});
                } else if(category.active === true){
                    res.json({category: category, message: "successfully found"});
                } else{
                    res.json({category: category, message: "deactivated category found"});
                }
            } else{
                err.message = "No category with specific id found";
                res.status(400).send(err);
            }
        });
    })
    
    .delete(function(req,res){
        //deactivate category instead
        var id = req.params.id;
        Category.update({_id:id}, {$set: {active:false}}, function(err){
            res.json({message: "category deactivated"});    
        });
    })

//for testing only
router.route("/dropdb")
    .delete(function(req,res){
        Product.remove({}).exec();
        Category.remove({}).exec();
        res.json({message: "database dropped"});
    })
    
// all of routes will be prefixed with /api
app.use('/api', router);

app.listen(port);