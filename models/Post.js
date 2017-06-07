var mongoose = require('mongoose');

module.exports = mongoose.model('Post', {
   userId: String, //_id from the user table
   image: String, //url to image file
   comment: String, //poster's comment
   likeCount: Number, //number of likes (convenience value)
   feedbackCount: Number //number of comments from others (convenience value)
});