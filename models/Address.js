const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      required: true,
    },
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    mobile: {
      type: String,
    },
    streetAddress: {
      type: String,
    },
    apt: {
      type: String,
    },
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    zip: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Address", AddressSchema);
