var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var ObjectId     = Schema.ObjectId;

// product may belong to other product parents, e.g.: boots have different sizes
// and different colors, each of them should have been one entry in database.
// probably something like ProductDisplay class would be good, but I don't think it's needed now.
var CategorySchema   = new Schema({
    name: String,
    childCategories: [ObjectId], // all children categories for a category will be here.
    parentCategory: ObjectId // only direct parent category will be stored here
});

module.exports = mongoose.model('Category', CategorySchema);