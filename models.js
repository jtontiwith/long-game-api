'use strict'

const mongoose = require('mongoose');

//schema to represent a user outcome
const outcomesModelSchema = mongoose.Schema({
  whatText: { type: String, required: true },
  whyText: { type: String },
  date: { type: Date },
  range: { type: Number, min: 1, max: 1826 },
  user_id: { type: String, required: true },
  editing: { type: Boolean, default: false },
  showDetail: { type: Boolean, default: false } 
});

outcomesModelSchema.methods.serialize = function() {
  return {
    id: this.id,
    whatText: this.whatText,
    whyText: this.whyText,
    date: this.date,
    range: this.range,
    user_id: this.user_id,
    editing: this.editing,
    showDetail: this.showDetail 
  }
}

//everything is defined above so make the call to model

const outcomesModel = mongoose.model('outcomesModel', outcomesModelSchema);

module.exports = { outcomesModel };