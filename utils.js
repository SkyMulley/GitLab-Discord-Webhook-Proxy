module.exports.short = function(text, max) {
  if(text.length > 1999) {
    return text.substring(0, 2000) + "...";
  }
  return text;
};
