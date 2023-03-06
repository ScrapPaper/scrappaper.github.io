// Make Ten (Input Handling)
// by Lucas

// Creates a new digit input
const addDigit = (before) => {
    const digitTemplate = document.getElementById('digit');
    const numbers = digitTemplate.parentElement;
    // Create and insert the new digit
    const digit = digitTemplate.cloneNode(true);
    digit.removeAttribute('id');
    digit.classList.remove('template');
    before = before || numbers.firstElementChild.nextElementSibling;
    numbers.insertBefore(digit, before);
    // Register event listeners on input
    const input = digit.getElementsByTagName('input')[0];
    input.addEventListener('keydown', handleDigitInput);
    input.classList.add('digit-input');
    input.focus();
    // Display delete button upon digit hover
    const btnDelete = digit.getElementsByClassName('delete')[0];
    const btnState = hiddenState(btnDelete);
    digit.addEventListener('mouseover', () => btnState.isHover(true));
    digit.addEventListener('mouseleave', () => btnState.isHover(false));
    // Display delete button upon input focus
    input.addEventListener('focus', () => btnState.isFocus(true));
    input.addEventListener('focus', () => input.setSelectionRange(1, 1));
    input.addEventListener('blur', () => btnState.isFocus(false));
    // Enable digit deletion
    btnDelete.addEventListener('click', () => {
        delDigit(input);
    });
    numDigits++;
    setTimeout(onUpdateEvent, 0);
};

// Deletes a digit `input`
const delDigit = (input) => {
    if (numDigits > minDigits) {
        getAdjacentInput(input).focus();
        input.parentElement.remove();
        numDigits--;
        setTimeout(onUpdateEvent, 0);
    }
};

// Handles digit input validation and navigation on key down
const handleDigitInput = (e) => {
    let error;
    const input = e.target;
    const nextInput = getAdjacentInput(input, true);
    const prevInput = getAdjacentInput(input, false);
    // Digit input
    if (/^\d$/.test(e.key)) {
        // Overwrite existing digit and focus the next digit
        if (input.id !== 'target-input') {
            if (input.value !== e.key) {
                setTimeout(onUpdateEvent, 0);
            }
            e.preventDefault();
            input.value = e.key;
            nextInput.focus();
        } else {
            setTimeout(onUpdateEvent, 0);
        }
        error = '';
    } else if (e.key === 'Backspace') {
        // Backspace previous digit if current digit already empty
        if (input.value === '') {
            prevInput && prevInput.focus();
        }
        error = '';
        setTimeout(onUpdateEvent, 0);
    // Navigate inputs
    } else if (e.key === 'ArrowLeft') {
        prevInput && prevInput.focus();
        e.preventDefault();
    } else if (e.key === 'Enter' || e.key === 'ArrowRight') {
        nextInput && nextInput.focus();
        e.preventDefault();
    // Single key inputs
    } else if (/^.$/.test(e.key) && !e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        // Add hotkey
        if (e.key === '+' && input.id !== 'target-input') {
            addDigit(input.parentElement.nextElementSibling);
        // Delete hotkey
        } else if (e.key === '-' && input.id !== 'target-input') {
            delDigit(input);
        // Unknown key
        } else {
            error = 'Please enter digits (0 - 9) only';
        }
    }
    if (error !== undefined) {
        document.getElementById('error').innerText = error;
    }
};

// Retrieves adjacent inputs
const getAdjacentInput = (input, next) => {
    let adjDigit = input.parentElement.previousElementSibling;
    if (next === true || (next === undefined && adjDigit.tagName !== 'DIV')) {
        adjDigit = input.parentElement.nextElementSibling;
    }
    return adjDigit.getElementsByClassName('input')[0];
};

// Manages the visibility of an element (for delete buttons)
const hiddenState = (btn) => {
    let isHover = false;
    let isFocus = false;
    let state = false;
    const update = () => {
        if (state !== (isHover || isFocus)) {
            state = isHover || isFocus;
            btn.classList.toggle('hidden');
        }
    }
    return {
        isHover: (state) => {
            isHover = state;
            update();
        },
        isFocus: (state) => {
            isFocus = state;
            update();
        }
    }
};

// Dispatch update events to listeners
let updateListeners = [];
const onUpdateEvent = () => {
    let digits = document.getElementsByClassName('digit-input');
    let inputs = Array.from(digits).map(digit => digit.value);
    let targetInput = document.getElementById('target-input');
    let target = targetInput.value || targetInput.placeholder;
    const invalid = inputs.indexOf('') !== -1;
    
    inputs = inputs.map(Number);
    target = Number(target);
    updateListeners.forEach(listener => listener({inputs, target, invalid}));
};

// Registers a `listener` to receive update events
export const addUpdateListener = (listener) => {
    updateListeners.push(listener);
};

let minDigits = 2;
let numDigits = 0;

for (let i = 0; i < 4; i++) {
    addDigit();
}

document.getElementById('btn-add').addEventListener('click', () => addDigit());
document.getElementById('target-input').addEventListener('keydown', handleDigitInput);
