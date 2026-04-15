const form = document.querySelector('form');

console.log(form);

form.addEventListener('submit', function(e){
    e.preventDefault();

    const inputs = document.querySelectorAll('input');

    let blankInputs = false;

    inputs.forEach(input => {
        if(input.value == '' || input.value == null){
            blankInputs = true;
        }
    });

    if(blankInputs == true){
        push("Les entrées ne peuvent pas être vide.", "warning");
    }
});