const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true },
    address: DataTypes.STRING,
    sex: {
      type: DataTypes.ENUM("male", "female", "other"),
      defaultValue: "other",
    },
    phone_number: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM("admin", "parent", "driver"),
      allowNull: false,
    },
    date_of_birth: DataTypes.DATE,
  },
  { timestamps: true }
);

module.exports = User;
