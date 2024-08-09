const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
});

const trackerSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  data: { type: Object, required: false },
  userId: { type: mongoose
    .Schema.Types.ObjectId, ref: 'User', required: true },
});

const analyticsSchema  = new mongoose.Schema({

  type: {type:String , default:'month'},
  period: {type:Date , require:true},
  code :{type:String , required:true}

})

const User = mongoose.model('User', userSchema);
const Tracker = mongoose.model('Tracker', trackerSchema);
const Analytics = mongoose.model('Analytics', analyticsSchema)

module.exports = { User, Tracker ,Analytics };
