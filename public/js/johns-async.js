// helpers
var _async = {
  forEachSeries: function(array, fn, onComplete) {
    onComplete = onComplete || function() {};
    (function callFnOnIndex(index, err) {
      if (index >= array.length || err) { return onComplete(err); }
      fn(array[index], function(err) {
        if (index < array.length - 1) {
          callFnOnIndex(++index, err);
        } else {
          onComplete();
        }
      });
    })(0);
  },
  waterfall: function(arrayFns, onComplete) {
    onComplete = onComplete || function() {};
    (function callFnNumber(index, passVal, err) {
      if (!arrayFns[index] || err) { return onComplete(err); }
      var args = [passVal, function(response, err) {
        callFnNumber(++index, response, err);
      }].filter(function(el) { return !!el; });
      arrayFns[index].apply(arrayFns, args);
    })(0);
  }
};
