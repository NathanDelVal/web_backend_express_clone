const mongoose = require("mongoose");

module.exports = {
  gedFileSystemSchema: mongoose.model(
    "ged_file_system",
    {
      _id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      level: {
        type: String,
        required: true,
      },
      isDirectory: {
        type: Boolean,
      },
      parent: {
        type: String,
        required: true,
      },
      root: {
        type: Number,
      },
    },
    "ged_file_system"
  ),
};
