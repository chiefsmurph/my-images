var postManager = (function() {
  var posts;
  return {
    getAllPosts: function() {
      function httpGet(theUrl) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", theUrl, false);
        xmlHttp.send(null);
        return JSON.parse(xmlHttp.responseText);
      }
      posts = httpGet('/posts');
      return posts;
    },
    getPostFromAttr: function (attr, val) {
      for (var i = 0; i < posts.length; i++) {
        if (posts[i][attr] === val) {
          var url = posts[i].url;
          return posts[i];
        }
      }
      return null;
    }
  }
})();
