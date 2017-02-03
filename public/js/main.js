window.onload = function () {
  inputHandler('post-score', validatePostForm);
  inputHandler('place-password', validatePlaceForm);
  inputHandler('place-date', validatePlaceForm);
  inputHandler('login-name', validateLoginForm);
  inputHandler('login-password', validateLoginForm);
  submissionHandler('post-form', validatePostForm);
  submissionHandler('place-form', validatePlaceForm);
  submissionHandler('login-form', validateLoginForm);

  PullToRefresh.init({
    mainElement: 'main',
    onRefresh: function(){window.location.reload();}
  });
};

function validatePostForm(event) {
  var scoreInput = document.getElementById('post-score');
  var valid = scoreInput.value && Number.isInteger(Number(scoreInput.value));

  if(!valid && event.type==='submit') event.preventDefault();

  disableInput('post-submit', !valid);
  disableInput('post-competitive', !valid);
  disableInput('post-ace', !valid);
}

function validatePlaceForm(event) {
  var passwordInput = document.getElementById('place-password');
  var dateInput = document.getElementById('place-date');
  var valid = passwordInput.value!=='' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.value);

  if(!valid && event.type==='submit') event.preventDefault();

  disableInput('place-submit', !valid);
}

function validateLoginForm(event) {
  var nameInput = document.getElementById('login-name');
  var passwordInput = document.getElementById('login-password');
  var valid = passwordInput.value!=='' && nameInput.value!=='';

  if(!valid && event.type==='submit') event.preventDefault();

  disableInput('login-submit', !valid);
}

function inputHandler(id, handler) {
  var input = document.getElementById(id);
  if(input !== null){
    input.oninput = handler;
  }
}

function submissionHandler(id, handler) {
  var form = document.getElementById(id);
  if(form !== null){
    form.addEventListener('submit', handler);
  }
}

function disableInput(name, disabled) {
  var input = document.getElementById(name);
  if(input !== null){
    input.disabled = disabled;
  }
}

function toggleBadges(id) {
  var badges = document.getElementById('badges-'+id);
  badges.classList.toggle('badges-hidden');
}
