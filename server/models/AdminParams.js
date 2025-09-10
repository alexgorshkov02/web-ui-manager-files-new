const { Schema, model } = require("mongoose");

const adminParamsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: String,
      required: false,
      unique: false,
      trim: true,
    },
    group: {
      type: String,
      enum: ["general", "authentication", "folders"],
      required: false,
      unique: false,
      trim: true,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

const AdminParams = model("AdminParams", adminParamsSchema);

module.exports = AdminParams;
