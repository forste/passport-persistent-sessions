
/*
 * GET home page.
 */

var ejs = require('ejs');
var fs = require('fs');
console.log(__dirname);
var index = fs.readFileSync('views/index.ejs');
var template = ejs.compile(index.toString());

exports.index = function(req, res){
    console.log('index', index);
    return res.send(template());
};