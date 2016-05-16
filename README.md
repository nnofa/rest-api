This is a rest-api test.

The apis are:
/api/product/:id : get or delete a product // GET or DEL whichever appropriate

/api/products[?filter] : get all products, can be filtered by color, and size // GET

/api/product/    : post a product // POST


/api/category/:id : get or deactivate a product // GET or DEL request whichever appropriate

/api/category/    : post a category //POST

/api/categories/  : retrieve all categories //GET

Specification of product  : have unique id. [Name, Color, and Size] must be unique, can have category.

Specification of category : have a name, can have a parent category or childCategories. 
For now, parent category must be added first before referencing it to the child.
