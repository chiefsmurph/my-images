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

    // var img = document.createElement("img");
    //
    // img.onload = function() {
    //
    // };
    // img.src = url;

    //
    var http = new XMLHttpRequest();
    http.open("GET", url, true);
    http.responseType = "blob";
    http.onload = function(e) {
        if (this.status === 200) {
            var image = new Image();
            image.onload = function() {

              console.log('loaded')
              try {

                EXIF.getData(image, function() {
                  var orientation = EXIF.getTag(this, 'Orientation');
                  var rotation = {
                    1: 'rotate(0deg)',
                    3: 'rotate(180deg)',
                    6: 'rotate(90deg)',
                    8: 'rotate(270deg)'
                  };
                  console.log(orientation);

                  image.className = 'rotate';

                  canvasContainer.appendChild(image);
                  cb();
                  // cb();
                });
              } catch (err) {
                console.log('err')
                canvasContainer.appendChild(image);
                cb();
              }
            };
            image.src = URL.createObjectURL(http.response);

        }
    };
    http.send();
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
