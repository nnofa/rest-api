var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var ObjectId     = Schema.ObjectId;

// product may belong to other product parents, e.g.: boots have different sizes
// and different colors, each of them should have been one entry in database.
// probably something like ProductDisplay class would be good, but I don't think it's needed now.
var CategorySchema   = new Schema({
    name: {type: String, required:true},
    childCategories: [this], // all children categories for a category will be here.
    parentCategory: this, // only direct parent category will be stored here
    active: {type: Boolean, required:true}
});

CategorySchema.index({name:1}, {unique:true})
module.exports = mongoose.model('Category', CategorySchema);