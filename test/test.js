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
  });
  
  
});