onload = function () {
  var input = document.getElementById('post-score');
  if(input != null){
    input.value = '';
    input.oninput = input_handler;
    input.onpropertychange = input.oninput;
  }
};

function input_handler(event){
  console.log(event.target.value);
  var valid = event.target.value && Number.isInteger(Number(event.target.value))
  document.getElementById('post-submit').disabled = !valid;
}
