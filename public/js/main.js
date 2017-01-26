onload = function () {
  var postInput = document.getElementById('post-score');
  var placeInput = document.getElementById('place-password');
  if(postInput != null){
    postInput.value = '';
    postInput.oninput = posthandler;
    postInput.onpropertychange = postInput.oninput;
  }
  if(placeInput != null){
    placeInput.value = '';
    placeInput.oninput = placehandler;
    placeInput.onpropertychange = placeInput.oninput;
  }
};

function posthandler(event){
  var valid = event.target.value && Number.isInteger(Number(event.target.value));
  document.getElementById('post-submit').disabled = !valid;
}

function placehandler(event){
  var valid = event.target.value && event.target.value!=='';
  document.getElementById('place-submit').disabled = !valid;
}
