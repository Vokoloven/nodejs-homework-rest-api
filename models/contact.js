const { Schema, model, SchemaTypes } = require('mongoose');

const contactSchema = Schema(
  {
    name: { type: String, require: true },
    email: { type: String, require: true },
    phone: { type: String, require: true },
    favorite: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: SchemaTypes.ObjectId,
      required: true,
      ref: 'user',
    },
  },
  { versionKey: false, timestamps: true }
);

const Contact = model('contacts', contactSchema);

module.exports = Contact;
