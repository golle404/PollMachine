var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var passportLocalMongoose = require('passport-local-mongoose');


var PollOptions = new Schema({
	option: String,
	votes: {type: Number, default: 0}
})

var Poll = new Schema({
    owner: String,
    question: String,
	private: {type: String, default: "off"},
	privateKey: {type:String, default: ""},
	options: [PollOptions]
});

//Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Poll', Poll);
//module.exports = mongoose.model('PollOptions', PollOptions);