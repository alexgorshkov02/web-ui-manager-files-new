const { Schema, model } = require("mongoose");

const notificationSchema = new Schema(
  {
    customer: {
      type: String,
      required: false,
      unique: false,
      trim: true,
    },
    directory: {
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
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

const Notification = model("Notification", notificationSchema);

module.exports = Notification;
