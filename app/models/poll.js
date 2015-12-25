var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// poll options sub-shema
var PollOptions = new Schema({
	option: String,
	votes: {type: Number, default: 0}
})
// poll shema
var Poll = new Schema({
    owner: String,
    question: String,
	created: {type: Date, default: Date.now },
	private: {type: String, default: "off"},
	privateKey: {type:String, default: ""},
	options: [PollOptions]
});


module.exports = mongoose.model('Poll', Poll);