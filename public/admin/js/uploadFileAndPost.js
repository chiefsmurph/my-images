function getSignedRequest(file){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', `/sign-s3?file-name=${file.name}&file-type=${file.type}`);
  xhr.onreadystatechange = function() {
    if(xhr.readyState === 4){
      if(xhr.status === 200){
        var response = JSON.parse(xhr.responseText);
        uploadFile(file, response.signedRequest, response.url);
      }
      else{
        //alert('Could not get signed URL.');
        iconUI.fail();
      }
    }
  };
  xhr.send();
}

function uploadFile(file, signedRequest, url){
  var xhr = new XMLHttpRequest();
  xhr.open('PUT', signedRequest);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4){
      if (xhr.status === 200){
        postPost(url);
      } else{
        //alert('Could not upload file.');
        iconUI.fail();
      }
    }
  };
  xhr.send(file);
}

function postPost(url) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/post');
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.onload = function () {
    // do something to response
    console.log(this.responseText);
    if (this.responseText) {
      // successful upload
      addPostMarkup(JSON.parse(this.responseText), true); // prepend
      iconUI.success();
    } else {
      iconUI.fail();
    }
  };
  xhr.send('url=' + url);
}
