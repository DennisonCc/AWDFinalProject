const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const invoiceSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  clientEmail: {
    type: String,
    required: true,
    trim: true
  },
  product: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  total: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

invoiceSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Invoice', invoiceSchema);
