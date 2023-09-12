const { Schema, model } = require("mongoose");

const notificationSchema = new Schema(
  {
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
