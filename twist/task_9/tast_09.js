function performOperation(operation) {
    const num1 = document.getElementById('num1').value;
    const num2 = document.getElementById('num2').value;
    const resultDiv = document.getElementById('result');

    // Check if inputs are numbers
    if (isNaN(num1) || isNaN(num2) || num1 === '' || num2 === '') {
        resultDiv.textContent = ""; // Clear result if invalid input
        alert("Please enter valid numbers in both fields.");
        return;
    }

    const n1 = parseFloat(num1);
    const n2 = parseFloat(num2);

    let result;

    switch (operation) {
        case 'add':
            result = n1 + n2;
            break;
        case 'subtract':
            result = n1 - n2;
            break;
        case 'multiply':
            result = n1 * n2;
            break;
        case 'divide':
            if (n2 === 0) {
                alert("You tried to divide by zero");
                return;
            }
            result = n1 / n2;
            break;
        default:
            result = "Unknown operation";
    }

    resultDiv.textContent = `Result: ${result}`;
}
