document.querySelector('body').innerHTML += `
    <div class="push-wrapper"></div>
`

let wrapper = document.querySelector('.push-wrapper');

function push(pushText){
    let pushTemplate = `
        <div class="push">
            <p>${pushText}</p>
        </div>
    `

    wrapper.innerHTML += pushTemplate;
}

function pushError(errorText){
    push(errorText);

    let lastPush = document.querySelectorAll('.push')[document.querySelectorAll('.push').length - 1];

    lastPush.classList.add('push-error');

    let icon = document.createElement('i');
    icon.classList.add('fa-regular', 'fa-circle-xmark');
    lastPush.insertBefore(icon, lastPush.querySelector('p'));
}
function pushWarning(warningText){
    push(warningText);

    let lastPush = document.querySelectorAll('.push')[document.querySelectorAll('.push').length - 1];

    lastPush.classList.add('push-warning');

    let icon = document.createElement('i');
    icon.classList.add('fa-regular', 'fa-triangle-exclamation');
    lastPush.insertBefore(icon, lastPush.querySelector('p'));
}
function pushSuccess(successText){
    push(successText);

    let lastPush = document.querySelectorAll('.push')[document.querySelectorAll('.push').length - 1];

    lastPush.classList.add('push-success');

    let icon = document.createElement('i');
    icon.classList.add('fa-regular', 'fa-circle-check');
    lastPush.insertBefore(icon, lastPush.querySelector('p'));
}

pushWarning("Mot de passe et/ou identifiant incorret.");