const { Schema, model } = require("mongoose");

const profileParamsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    sorting: {
      field: { type: String, enum: ["name", "size", "ctime"], required: false },
      direction: { type: String, enum: ["asc", "desc"], required: false },
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

const ProfileParams = model("ProfileParams", profileParamsSchema);

module.exports = ProfileParams;
