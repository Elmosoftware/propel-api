var Service = require('node-windows').Service;
const prod = require('./package.json').productName;
const ver = require('./package.json').version;
const desc = require('./package.json').description;

//Creating the service object:
var serviceDefinition = new Service({
  name: prod,
  description: `${desc} - v${ver}`,
  script: require('path').join(__dirname,'index.js')
});

module.exports = serviceDefinition;