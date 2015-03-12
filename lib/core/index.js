var model = require('model');

module.exports = model('User')
  .attr('name')
  .attr('mail')
  .attr('nick');

var templ = require('./core');
console.log('core loaded');