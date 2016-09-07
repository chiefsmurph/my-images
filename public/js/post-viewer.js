var imgDims = {};
var postViewer = (function() {

  var canvasContainer;

  var pdfPreviewModule = (function() {

    var pdf = {};

    // PDF.js related
    var PdfJsRelated = {

      openPage: function(pageNumber, cb) {
        var reqId = pdf.reqId;
        pdf.doc.getPage(pageNumber).then(function(page) {
          if (reqId !== pdf.reqId) { return; }
          var viewport = page.getViewport(2);

          var canvas = document.createElement('canvas');
          var ctx = canvas.getContext('2d');
          var renderContext = {
            canvasContext: ctx,
            viewport: viewport
          };

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          page.render(renderContext);
          canvasContainer.appendChild(canvas);

          pdf.docDimensions = pdf.docDimensions || {
            width: viewport.width,
            height: viewport.height
          };

          cb();
        });
      },

      renderAllPages: function(onComplete) {
        var pageArr = Array.apply(null, {length: pdf.doc.numPages}).map(Number.call, Number);
        _async.forEachSeries(pageArr, function(pageNum, callback) {
          PdfJsRelated.openPage(pageNum + 1, callback);
        }, onComplete);
      },

      openPdfUrl: function(url, cb) {
        if (!canvasContainer) return cb(true);

        pdf.url = url;
        PDFJS.workerSrc = '/bower_components/pdfjs-dist/build/pdf.worker.js';
        return PDFJS.getDocument(url).then(function(doc) {
          pdf.doc = doc;
          PdfJsRelated.renderAllPages(cb);
        }).catch(function(error) {

          if (error.name === "InvalidPDFException") {
            console.error('Unable to load PDF');
          } else if (error.name === "UnexpectedResponseException" && error.status === 0) {
            console.error('Unable to load PDF. Check your internet connection.');
          } else {
            console.error(error.message);
          }
          cb(error);

        });

      }

    }


    return {
      openPdf: PdfJsRelated.openPdfUrl
    };

  })();

  function appendImage(url, cb) {
    if (!canvasContainer) return cb(true);

    var image = document.createElement("img");
    image.onerror = function() {
      console.error(url + ' unable to open.');
      cb();
    }
    image.onload = function() {
      console.log('loaded')
      try {

        EXIF.getData(image, function() {

          var orientation = EXIF.getTag(this, 'Orientation');
          var dims = {
            width: EXIF.getTag(this, 'ImageWidth'),
            height: EXIF.getTag(this, 'ImageHeight')
          };
          imgDims[url] = dims;
          var rotation = {
            1: 'rotate(0deg)',
            3: 'rotate(180deg)',
            6: 'rotate(90deg)',
            8: 'rotate(270deg)'
          };

          canvasContainer.appendChild(image);

          if (orientation === 6) {
            image.className = 'rotate';
            newRotation(image);
          }

          cb();
          // cb();
        });
      } catch (err) {
        console.log('err')
        canvasContainer.appendChild(image);
        cb();
      }
    };
    image.src = url;

    //
    // try {
    //   var http = new XMLHttpRequest();
    //   http.open("GET", url, true);
    //   http.responseType = "blob";
    //   http.onerror = function(e) {
    //     console.log(e, 'asd');
    //   }
    //   http.onload = function(e) {
    //       if (this.status === 200) {
    //           var image = new Image();
    //           image.onload = function() {
    //
    //
    //           };
    //           image.src = URL.createObjectURL(http.response);
    //
    //       }
    //   };
    //   http.send();
    //
    //
    // } catch (err) {
    //   console.log('err');
    //   cb();
    // }

  }



  function embedVid(url) {
    if (!canvasContainer) return cb(true);

    var newDiv = document.createElement('div');
    newDiv.id = url;
    canvasContainer.appendChild(newDiv);
    jwplayer(url).setup({
        'id': url,
        'wmode': 'transparent',
        'icons': 'true',
        'allowscriptaccess': 'always',
        'allownetworking': 'all',
        'file': url,
        'width': '100%', 'height': '100%',
        'controlbar': 'bottom',
        'dock': 'false',
        'provider':'rtmp',
        'streamer':'rtmp://s2uxp0y7js2nx5.cloudfront.net/cfx/st',
        'modes': [
            {type: 'flash', src: '/js/jwplayer/jwplayer.flash.swf'},
            {
              type: 'html5',
              config: {
               'file': url,
               'provider': 'video'
              }
            },
            {
              type: 'download',
              config: {
               'file': url,
               'provider': 'video'
              }
            }
        ]
    });
  }

  return {
    setContainer: function(el) {
      canvasContainer = el;
    },
    renderPdf: pdfPreviewModule.openPdf,
    renderImg: appendImage,
    renderFile: function(url, cb) {
      var ext = (function getUrlExtension(url) {
        var re = /(?:\.([^.]+))?$/;
        return re.exec(url)[1];
      })(url);
      if (ext === 'pdf') {
        pdfPreviewModule.openPdf(url, function(err) {
          setTimeout(function() {
            cb(err);
          }, 200);
        });
      } else if (ext === 'mov' || ext === 'mp4' || ext === 'flv') {
        embedVid(url);
        setTimeout(cb, 400);
      } else {
        appendImage(url, function(err) {
          setTimeout(function() {
            cb(err);
          }, 200)
        });
      }
    }
  };
})();
