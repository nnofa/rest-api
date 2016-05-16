var supertest = require("supertest");
var should = require("should");

// This agent refers to PORT where program is runninng.

var server = supertest.agent("https://rest-api-nnofa.c9users.io/api");
// UNIT test begin

describe("API tests",function(){

  //drop all values in database first
  before(function(done){
    server.del("/dropdb").end(function(err, res){
      done();  
    });  
  });
  
  describe("test categories API", function(){
    // #1 should return the category
    it("create and retrieve category",function(done){
      var name = "first category"
      
      server
      .post("/category")
      .send({name: name})
      .expect("Content-type",/json/)
      .end(function(err,res){
        res.status.should.equal(200);
        res.body.message.should.equal("category created");
        res.body.category.name.should.equal(name);
        var retCat = res.body.category;
        
        server
        .get("/category/" + res.body.category._id)
        .expect("Content-type",/json/)
        .end(function(errG,resG){
          resG.status.should.equal(200);
          var getCat = resG.body.category;
          
          retCat.name.should.equal(getCat.name);
          done();  
        });
      });
    });
    
    // #2 create a category and a parent category
    // TODO: more level of categories.
    it("create a parent-child categories", function(done){
      var pName = "Parent Categories";
      var cName = "Child Categories";
      
      server.
      post("/category")
      .send({name: pName})
      .end(function(errP,resP){
        resP.status.should.equal(200);
        resP.body.message.should.equal("category created");
        resP.body.category.name.should.equal(pName);
        var parentId = resP.body.category._id;
        
        //post child category
        server.post("/category")
        .send({name: cName, parentCategory: parentId})
        .end(function(errC, resC){
            resC.status.should.equal(200);
            resC.body.message.should.equal("category created");
            resC.body.category.name.should.equal(cName);
            resC.body.category.parentCategory.should.equal(parentId);
            done();
        });
      });
    });
    
    // #3 create a duplicate category, should fail
    it("create a duplicate category", function(done){
      var name = "duplicate category"
      
      server
      .post("/category")
      .send({name: name})
      .expect("Content-type",/json/)
      .expect(200) // THis is HTTP response
      .end(function(err,res){
        res.body.message.should.equal("category created");
        res.body.category.name.should.equal(name);

        server
        .post("/category")
        .send({name: name})
        .expect("Content-type",/json/)
        .end(function(err,res){
          res.status.should.equal(400);
          res.body.code.should.equal(11000); // duplicate error in mongo
          done();
        });
      });
    });
    
    // #4 invalid Id of parentCategory
    it("create a category with invalid parentCategory", function(done){
      var name = "invalid parent category"
      
      server
      .post("/category")
      .send({name: name, parentCategory:"asdf"})
      .expect("Content-type",/json/)
      .end(function(err,res){
        res.status.should.equal(400);
        res.body.message.should.equal("Invalid parent category id");
        done();
      });
    });
    
    // #5 try to post, delete, then get a category
    it("create category then delete it directly", function(done){
      var name = "deactivated category"
      
      server
      .post("/category")
      .send({name: name})
      .expect("Content-type",/json/)
      .end(function(err,res){
        res.status.should.equal(200);
        res.body.message.should.equal("category created");
        res.body.category.name.should.equal(name);
        var retCat = res.body.category;
        
        server
        .del("/category/" + res.body.category._id)
        .expect("Content-type",/json/)
        .end(function(errDel,resDel){
          resDel.body.message.should.equal("category deactivated");
          
          server
          .get("/category/" + res.body.category._id)
          .expect("Content-type",/json/)
          .end(function(errG,resG){
            resG.status.should.equal(200);
            resG.body.message.should.equal("deactivated category found");
            done();  
          });
        });
        
      });  
    });
  });
  
  //TODO: create product api test
  describe("test products API", function(){
    // #1 create a normal product
    it("create a product and retrieve it", function(done){
      var name = "first product";
      var size = 1;
      var color = 1;
      var price = 10;
      
      server
      .post("/product")
      .send({name: name, size: size, color:color, price:price})
      .expect("Content-type",/json/)
      .end(function(err,res){
        res.status.should.equal(200);
        res.body.message.should.equal("product created");
        var retProd = res.body.product;
        retProd.name.should.equal(name);
        retProd.size.should.equal(size);
        retProd.color.should.equal(color);
        retProd.price.should.equal(price);
        
        server
        .get("/product/" + retProd._id)
        .expect("Content-type",/json/)
        .end(function(errG,resG){
          resG.status.should.equal(200);
          var getProd = resG.body.product;
          
          retProd.name.should.equal(getProd.name);
          retProd.size.should.equal(getProd.size);
          retProd.color.should.equal(getProd.color);
          retProd.price.should.equal(getProd.price);
          done();  
        });
      });
    });
    
    // #2 create a duplicate product (duplicate means same name, color, and size)
    it("create duplicate product", function(done){
      var name = "duplicate product";
      var size = 1;
      var color = 1;
      var price = 10;
      
      server
      .post("/product")
      .send({name: name, size: size, color:color, price:price})
      .expect("Content-type",/json/)
      .end(function(err,res){
        res.status.should.equal(200);
        res.body.message.should.equal("product created");
        var retProd = res.body.product;
        retProd.name.should.equal(name);
        retProd.size.should.equal(size);
        retProd.color.should.equal(color);
        retProd.price.should.equal(price);
        
        server
        .post("/product")
        .send({name: name, size: size, color:color, price:price})
        .expect("Content-type",/json/)
        .end(function(errG,resG){
          resG.status.should.equal(400);
          resG.body.code.should.equal(11000); // duplicate error in mongo
          done();  
        });
      });
    });
    
    // #3 product with negative price
    it("create product with negative price", function(done){
      var name = "negative product";
      var size = 1;
      var color = 1;
      var price = -1;
      
      server
      .post("/product")
      .send({name: name, size: size, color:color, price:price})
      .expect("Content-type",/json/)
      .end(function(err,res){
        res.status.should.equal(400)
        res.body.message.should.equal("Validation failed");
        done();
      });
    });
    
    // #4 product with no name
    it("create a product with no name", function(done){
      var name = "";
      var size = 1;
      var color = 1;
      var price = -1;
      
      server
      .post("/product")
      .send({name: name, size: size, color:color, price:price})
      .expect("Content-type",/json/)
      .end(function(err,res){
        res.status.should.equal(400)
        res.body.message.should.equal("Validation failed");
        done();
      });
    });
    
    // #5 product with no size
    it("create a product with no size", function(done){
      var name = "no size product";
      var size = "";
      var color = 1;
      var price = -1;
      
      server
      .post("/product")
      .send({name: name, size: size, color:color, price:price})
      .expect("Content-type",/json/)
      .end(function(err,res){
        res.status.should.equal(400)
        res.body.message.should.equal("Validation failed");
        done();
      });
    });
    
    // #6 product with category
    it("#create a product and a category", function(done){
      var cname = "New category for product";
      var pname = "New product with category";
      var size = 1;
      var color = 1;
      var price = 10;
      
      server
      .post("/category")
      .send({name: cname})
      .expect("Content-type",/json/)
      .end(function(err,res){
        res.status.should.equal(200);
        res.body.message.should.equal("category created");
        res.body.category.name.should.equal(cname);
        var categoryId = res.body.category._id;
        
        server
        .post("/product")
        .send({name: cname, size: size, color:color, price:price, categories:[categoryId]})
        .expect("Content-type",/json/)
        .end(function(errP,resP){
          resP.status.should.equal(200)
          resP.body.product.should.have.property('categories').with.lengthOf(1);
          resP.body.product.categories.should.containEql(categoryId);
          done();
        });
      });
      
    });
    
    // #7 2 products then filter by size
    it("#create few products then filter by size", function(done){
      var firstName = "First filter product";
      var firstSize = 3;
      var firstColor = 5;
      var firstPrice = 100;
        
      var secondName = "Second filter product";
      var secondSize = 4;
      var secondColor = 6;
      var secondPrice = 200;
      
      server.del("/dropdb").end(function(err, res){
        //post first product
        server
        .post("/product")
        .send({name: firstName, size: firstSize, color:firstColor, price:firstPrice})
        .end(function(err,res){
          
          //post second product
           server
          .post("/product")
          .send({name: secondName, size: secondSize, color:secondColor, price:secondPrice})
          .end(function(err,res){
            server
            .get("/products?size=" + firstSize)
            .end(function(err,res){
              res.body.products.length.should.equal(1);
              res.body.products[0].name.should.equal(firstName);
              done();
            });
          });
        });
      });  
      
    });
    
    // #8 2 products then filter by color
    it("#create few products then filter by color", function(done){
      var firstName = "First filter product";
      var firstSize = 3;
      var firstColor = 5;
      var firstPrice = 100;
        
      var secondName = "Second filter product";
      var secondSize = 4;
      var secondColor = 6;
      var secondPrice = 200;
      
      server.del("/dropdb").end(function(err, res){
        //post first product
        server
        .post("/product")
        .send({name: firstName, size: firstSize, color:firstColor, price:firstPrice})
        .end(function(err,res){
          var firstProductId = res.body.product._id;
          //post second product
           server
          .post("/product")
          .send({name: secondName, size: secondSize, color:secondColor, price:secondPrice})
          .end(function(err,res){
            server
            .get("/products?color=" + firstColor)
            .end(function(err,res){
              res.body.products.length.should.equal(1);
              res.body.products[0].name.should.equal(firstName);
              res.body.products[0]._id.should.equal(firstProductId);
              done();
            });
          });
        });
      });  
      
    });
    
    // #9 2 products then filter by minprice and maxprice
    it("#create few products then filter by price", function(done){
      var firstName = "First filter product";
      var firstSize = 3;
      var firstColor = 5;
      var firstPrice = 100;
        
      var secondName = "Second filter product";
      var secondSize = 4;
      var secondColor = 6;
      var secondPrice = 200;
      
      server.del("/dropdb").end(function(err, res){
        //post first product
        server
        .post("/product")
        .send({name: firstName, size: firstSize, color:firstColor, price:firstPrice})
        .end(function(err,res){
          var firstProductId = res.body.product._id;
          //post second product
           server
          .post("/product")
          .send({name: secondName, size: secondSize, color:secondColor, price:secondPrice})
          .end(function(err,res){
            server
            .get("/products?priceMin=" + (firstPrice - 10) + "&priceMax=" + (secondPrice -10))
            .end(function(err,res){
              res.body.products.length.should.equal(1);
              res.body.products[0].name.should.equal(firstName);
              res.body.products[0]._id.should.equal(firstProductId);
              done();
            });
          });
        });
      });  
      
    });
  });
});