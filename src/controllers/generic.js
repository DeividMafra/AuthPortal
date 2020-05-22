var express = require('express');
var simpleCrud = express();

simpleCrud.createOne = (tableName, data) => {
  const columns = Object.keys(data);
  return `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES ?`;
};

simpleCrud.getList = tableName => {
  return `SELECT * FROM ${tableName}`;
};

simpleCrud.getOne = (tableName, paramId, id) => {
  return `SELECT * FROM ${tableName} WHERE ${paramId} = ${id}`;
};

simpleCrud.getUserFromAuth = (tableName, paramId, id) => {
  return `SELECT userId, name, email, date FROM ${tableName} WHERE ${paramId} = ${id}`;
};

simpleCrud.modifyOne = (tableName, data, paramId, id) => {
  const columns = Object.keys(data);
  return `UPDATE ${tableName} SET ${columns.join(" = ? ,") + " = ?"} WHERE ${paramId} = ${id}`;
};

simpleCrud.deleteOne = (tableName, paramId, id) => {
  return `DELETE FROM ${tableName} WHERE ${paramId} = ${id}`;
};

module.exports = simpleCrud;