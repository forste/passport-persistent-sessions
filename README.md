# persistent sessions with passport

this repository holds barebone code to enable persistent sessions with passport on expressjs/nodejs

# setup
* npm install
* mongodb
install mongodb, create database, add conf.js in root such as

```javascript
module.exports = {
  mongodbURL : 'mongodb://admin:peerby1234@localhost/peerby',
  mongodbName : 'peerby'
}
```
