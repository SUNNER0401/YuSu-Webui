const fs = require('fs');
const path = require('path');
const Mock = require('mockjs');
const JSON5 = require('json5');

function getJsonFile(filePath) {
  var json = fs.readFileSync(path.resolve(__dirname, filePath), 'utf-8');
  return JSON5.parse(json);
}

module.exports = function (app) {
  if (process.env.MOCK == 'true') {
    app.get('/example', function (rep, res) {
      var json = getJsonFile('./example.json5');
      res.json(Mock.mock(json));
    });
  }
};
