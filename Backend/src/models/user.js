const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    sex: {
      type: DataTypes.ENUM("male", "female", "other"),
      defaultValue: "other",
    },
    role: {
      type: DataTypes.ENUM("admin", "driver", "parent"),
      defaultValue: "parent",
    },
  },
  {
    tableName: "Users",
    timestamps: true,
  }
);

module.exports = User;
