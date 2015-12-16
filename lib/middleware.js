module.exports = function(instance) {
  return {
    httpBasic: require(__dirname + '/middleware/httpBasic')
  };
};
