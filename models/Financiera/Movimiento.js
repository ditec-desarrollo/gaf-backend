// models/Movimiento.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sequelize');

// const sequelize = require('../sequelize');

const Movimiento = sequelize.define('Movimiento', {
  movimiento_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  movimiento_fecha: {
    type: DataTypes.DATE,
    allowNull: false
  },
  expediente_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tipomovimiento_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  movimiento_id2 :{
    type: DataTypes.INTEGER,
    allowNull: true
  },
  tipoinstrumento_id :{
    type: DataTypes.INTEGER,
    allowNull: true
  },
  presupuesto_id :{
    type: DataTypes.INTEGER,
    allowNull: true
  },
  instrumento_nro :{
    type: DataTypes.STRING,
    allowNull: true
  },
  movimiento_protocolo :{
    type: DataTypes.STRING,
    allowNull: true
  },
  movimiento_actadm :{
    type: DataTypes.STRING,
    allowNull: true
  },
  movimiento_factura :{
    type: DataTypes.STRING,
    allowNull: true
  },
  proveedor_id:{
    type: DataTypes.INTEGER,
    allowNull: true
  },
  encuadrelegal_id:{
    type: DataTypes.INTEGER,
    allowNull: true
  },
  tipocompra_id:{
    type: DataTypes.INTEGER,
    allowNull: true
  }
},{
    tableName: 'movimiento',
    timestamps: false
});

module.exports = Movimiento;
