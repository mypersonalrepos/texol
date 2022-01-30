const mongoose = require('mongoose');


const schema = mongoose.Schema;
const productSchema = new schema({
    title: String,
    
    uniqueids: String,
    uniqueString: String,

    image: String
});



var productexport = mongoose.model('products', productSchema);
module.exports = productexport;