var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var ObjectId     = Schema.ObjectId;
//var Category     = require('category');

// product may belong to other product parents, e.g.: boots have different sizes
// and different colors, each of them should have been one entry in database.
// probably something like ProductDisplay class would be good, but I don't think it's needed now.
var ProductSchema   = new Schema({
    name: String,
    size: Number, // for salestock probably this is an enum of XXS, XS, S, M, L, XL, XXL, XXXL.
    color: Number, // or number. Convert rgb or hex value to long
    price: Number,
    //categories: [{type:ObjectId, ref:Category}]
});

//ProductSchema.index({category:1});
ProductSchema.index({name:1, size:1, colorj:1}, {unique:true});
module.exports = mongoose.model('Product', ProductSchema);