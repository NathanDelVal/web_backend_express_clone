const mongoose = require("mongoose");

module.exports = {
  schemaSupport: mongoose.model(
    "support_msgs",
    {
      useremail: {
        type: String,
        required: true,
      },
      chamado: {
        type: String,
        required: true,
      },
      deletado: {
        type: Number,
        default: 0,
      },
      messages: [
        {
          from: { type: String, required: true },
          msg: { type: String, required: true },
          createdAt: { type: String },
          updatedAt: { type: String },
        },
      ],
    },
    "support_msgs"
  ),
};
