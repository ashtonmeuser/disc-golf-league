onload = function () {
  document.getElementById('post-score').oninput = validatePostForm;
  document.getElementById('place-password').oninput = validatePlaceForm;
  document.getElementById('place-date').oninput = validatePlaceForm;
  document.getElementById('post-form').addEventListener('submit', validatePostForm);
  document.getElementById('place-form').addEventListener('submit', validatePlaceForm);
};

function validatePostForm(event) {
  var postScoreInput = document.getElementById('post-score');
  var valid = postScoreInput.value && Number.isInteger(Number(postScoreInput.value));

  if(!valid && event.type==='submit') event.preventDefault();

  disableInput('post-submit', !valid);
  disableInput('post-competitive', !valid);
  disableInput('post-ace', !valid);
}

function validatePlaceForm(event) {
  var postPasswordInput = document.getElementById('place-password');
  var placeDateInput = document.getElementById('place-date');
  var valid = postPasswordInput.value!=='' && /^\d{4}-\d{2}-\d{2}$/.test(placeDateInput.value);

  if(!valid && event.type==='submit') event.preventDefault();

  disableInput('place-submit', !valid);
}

function disableInput(name, disabled) {
  var input = document.getElementById(name);
  if(input !== null){
    input.disabled = disabled;
  }
}
