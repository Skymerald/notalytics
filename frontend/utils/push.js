document.querySelector('body').innerHTML += `
    <div class="push-wrapper"></div>
`

let wrapper = document.querySelector('.push-wrapper');

function push(pushText, pushType){
    const pushTemplate = document.createElement('div');
    pushTemplate.className = 'push';
    pushTemplate.innerHTML = `<p>${pushText}</p>`;

    let icon = document.createElement('i');

    if(pushType == "error"){
        pushTemplate.classList.add('push-error');

        icon.classList.add('fa-regular', 'fa-circle-xmark');
    }
    else if(pushType == "warning"){
        pushTemplate.classList.add('push-warning');

        icon.classList.add('fa-solid', 'fa-triangle-exclamation');
    }
    else if(pushType == "success"){
        pushTemplate.classList.add('push-success');

        icon.classList.add('fa-regular', 'fa-circle-check');
    }
    else{
        console.error("Push type is not supported.");
    }

    pushTemplate.insertBefore(icon, pushTemplate.querySelector('p'));

    wrapper.appendChild(pushTemplate);

    pushTemplate.classList.add('push-open')
    setTimeout(() => {
        pushTemplate.classList.remove('push-open');
        pushTemplate.classList.add('push-close');

        setTimeout(() => {
            pushTemplate.remove();
        }, 600);
    }, 3000);
}