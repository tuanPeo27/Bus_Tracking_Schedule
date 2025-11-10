const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Bus = sequelize.define(
  "Bus",
  {
    license_plate: { type: DataTypes.STRING, allowNull: false, unique: true },
    brand: { type: DataTypes.STRING },
    model: { type: DataTypes.STRING },
    seats: { type: DataTypes.INTEGER, defaultValue: 30 },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    status: {
      type: DataTypes.ENUM("available", "in_use", "maintenance", "inactive"),
      defaultValue: "available",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Bus;
