const mongoose = require("mongoose");

module.exports = {
  sendEmailSchema: mongoose.model(
    "validation_hash",
    {
      email: {
        type: String,
        required: true,
      },
      hash: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
      created_at: {
        type: Date,
        default: "",
      },
    },
    "validation_hash"
  ),
};
