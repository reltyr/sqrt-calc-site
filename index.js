// Helper function to validate input length
function validateInputLength(input, maxLength) {
    return input.length <= maxLength;
}

// Show and switch between tabs
function showTabs(tabId) {
    const tabs = document.querySelectorAll('.container');
    const buttons = document.querySelectorAll('.tab-button');

    tabs.forEach(tab => tab.classList.add('hidden'));
    buttons.forEach(button => button.classList.remove('active'));

    document.getElementById(tabId).classList.remove('hidden');
    buttons.forEach(button => {
        if (button.getAttribute('onclick').includes(tabId)) {
            button.classList.add('active');
        }
    });

    MathJax.typesetPromise();
}

document.getElementById('inputNumber').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        calculateSquareRoot();
    }
});

document.getElementById('fractionInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        calculateFractionSquareRoot();
    }
});

// Square root calculation for whole numbers
function calculateSquareRoot() {
    const errorElement = document.getElementById('errorMessage');
    const stepsList = document.getElementById('stepsList');
    const resultElement = document.getElementById('result');
    const inputNumber = document.getElementById('inputNumber').value.trim();

    // Clear previous messages and results
    errorElement.textContent = '';
    stepsList.innerHTML = '';
    resultElement.textContent = '';
    document.getElementById('calculationSteps').style.display = 'none';

    // Input validation
    if (!validateInputLength(inputNumber, 10)) {
        errorElement.textContent = 'Lütfen en fazla 10 basamaklı pozitif bir tam sayı girin.';
        setTimeout(() => (errorElement.textContent = ''), 3500);
        return;
    }

    if (!/^\d+$/.test(inputNumber) || inputNumber == "0") {
        errorElement.textContent = 'Lütfen pozitif bir tam sayı girin.';
        setTimeout(() => (errorElement.textContent = ''), 3500);
        return;
    }

    const num = parseInt(inputNumber);

    document.getElementById('calculationSteps').style.display = 'block';

    const steps = [];
    let simplifiedResult;

    const sqrtNum = Math.sqrt(num);
    if (sqrtNum === Math.floor(sqrtNum)) {
        // Perfect square
        steps.push(`\\(${num}\\) bir tam kare olduğundan karekökü \\(${sqrtNum}\\) olarak çıkar.`);
        simplifiedResult = `\\(${sqrtNum}\\) (tam olarak)`;
        resultElement.innerHTML = `\\(${num}\\) sayısının karekökü: ${simplifiedResult}`;
    } else {
        let factor = 1;
        for (let i = 2; i <= Math.sqrt(num); i++) {
            if (num % (i * i) === 0) {
                factor = i * i;
            }
        }

        if (factor === 1) {
            // Cannot simplify further
            steps.push(`\\(${num}\\) sayısının 1 dışında bir tam kare çarpanı olmadığından karekök daha fazla sadeleştirilemez.`);
            steps.push(`Bu yüzden, \\(\\sqrt{${num}}\\) hâlâ \\(\\sqrt{${num}}\\) veya \\(${sqrtNum.toFixed(6)}\\) olarak kalır.`);
            simplifiedResult = `\\(\\sqrt{${num}}\\)`;
            resultElement.innerHTML = `\\(${num}\\) sayısının karekökü: ${simplifiedResult} veya \\(${sqrtNum.toFixed(2)}\\)`;
        } else {
            const remainingFactor = num / factor;
            const factorSqrt = Math.sqrt(factor);
            steps.push(`\\(${num}\\) bir tam kare olmadığından şu şekilde sadeleştirilir:`);
            steps.push(`\\(\\sqrt{${num}} = \\sqrt{${factor} \\cdot ${remainingFactor}}\\)`);
            steps.push(`Şimdi, \\(\\sqrt{${num}} = \\sqrt{${factor}} \\cdot \\sqrt{${remainingFactor}}\\)`);
            steps.push(`\\(\\sqrt{${factor}} = ${factorSqrt}\\).`);
            steps.push(`Bu durumda, \\(\\sqrt{${num}} = ${factorSqrt}\\sqrt{${remainingFactor}}\\) veya \\(${sqrtNum.toFixed(5)}\\)... olur.`)
            simplifiedResult = `\\(${factorSqrt}\\sqrt{${remainingFactor}}\\)`;
            resultElement.innerHTML = `\\(${num}\\) sayısının karekökü: ${simplifiedResult} veya \\(${sqrtNum.toFixed(2)}\\)`;
        }
    }

    steps.forEach(step => {
        const li = document.createElement('li');
        li.innerHTML = step;
        stepsList.appendChild(li);
    });

    MathJax.typesetPromise();
}

// Square root calculation for fractions and decimals
function calculateFractionSquareRoot() {
    const errorElement = document.getElementById('fractionErrorMessage');
    const stepsList = document.getElementById('fractionStepsList');
    const resultElement = document.getElementById('fractionResult');
    const fractionInput = document.getElementById('fractionInput').value.trim();

    errorElement.textContent = '';
    stepsList.innerHTML = '';
    resultElement.textContent = '';

    document.getElementById('fractionSteps').style.display = 'none';

    if (!validateInputLength(fractionInput, 10)) {
        errorElement.textContent = 'Lütfen en fazla 10 karakterlik bir kesir girin.';
        setTimeout(() => (errorElement.textContent = ''), 3500);
        return;
    }

    let numerator, denominator;

    try {
        if (/^\d+\/\d+$/.test(fractionInput)) {
            // Parse fraction input
            [numerator, denominator] = fractionInput.split('/').map(Number);

            if (isNaN(numerator) || isNaN(denominator) || denominator === 0) throw new Error();

        } else if (/^\d*\.\d+$/.test(fractionInput)) {
            // Parse decimal input
            const decimal = parseFloat(fractionInput);

            if (isNaN(decimal) || decimal <= 0) throw new Error();

            const decimalPlaces = (decimal.toString().split('.')[1] || '').length;
            denominator = Math.pow(10, decimalPlaces);
            numerator = Math.round(decimal * denominator);

        } else {
            throw new Error();
        }

    } catch {
        errorElement.textContent = 'Lütfen geçerli bir kesir veya ondalık girin.';
        setTimeout(() => (errorElement.textContent = ''), 3500);
        return;
    }

    document.getElementById('fractionSteps').style.display = 'block';

    const steps = [];
    steps.push(`\\(${fractionInput}\\) şu şekilde kesir olarak yazılır: \\(\\frac{${numerator}}{${denominator}}\\).`);
    steps.push(`Karekök alınır: \\(\\sqrt{\\frac{${numerator}}{${denominator}}} = \\frac{\\sqrt{${numerator}}}{\\sqrt{${denominator}}}\\).`);

    function simplifySquareRoot(num) {
        let factor = 1;
        for (let i = 2; i <= Math.sqrt(num); i++) {
            while (num % (i ** 2) === 0) {
                factor *= i;
                num /= (i ** 2);
            }
        }

        return { coefficient: factor, remainder: num };
    }

    const { coefficient: numCoeff, remainder: numRemain } = simplifySquareRoot(numerator);
    const { coefficient: denomCoeff, remainder: denomRemain } = simplifySquareRoot(denominator);

    const formatSqrt = (coeff, remain) => {
        if (remain === 1) return coeff.toString(); // Perfect square
        if (coeff === 1) return `\\sqrt{${remain}}`; // Pure square root
        return `${coeff}\\sqrt{${remain}}`; // Simplified square root
    };

    const sqrtNumerator = formatSqrt(numCoeff, numRemain);
    const sqrtDenominator = formatSqrt(denomCoeff, denomRemain);

    steps.push(`\\(\\sqrt{${numerator}} = ${sqrtNumerator}\\).`);
    steps.push(`\\(\\sqrt{${denominator}} = ${sqrtDenominator}\\).`);

    let rationalizedNumerator = sqrtNumerator;
    let rationalizedDenominator = sqrtDenominator;

    if (denomRemain !== 1) {
        const rationalizingFactor = denomRemain;
        rationalizedNumerator = `${numCoeff * denomCoeff}\\sqrt{${numRemain * denomRemain}}`;
        rationalizedDenominator = `${denomCoeff * rationalizingFactor}`;

        steps.push(`Payda rasyonelleştirilir:`);
        steps.push(`Hem pay hem de paydayı \\(\\sqrt{${rationalizingFactor}}\\) ile çarparız.`);
        steps.push(`Yeni kesir: \\(\\frac{${rationalizedNumerator}}{${rationalizedDenominator}}\\).`);
    }

    const numCoefficient = parseInt(rationalizedNumerator.match(/^\d+/)) || 1;
    const denomCoefficient = parseInt(rationalizedDenominator.match(/^\d+/)) || 1;

    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    const coeffGCD = gcd(numCoefficient, denomCoefficient);

    let simplifiedResult = `\\frac{${rationalizedNumerator}}{${rationalizedDenominator}}`;

    let simplifiedNumerator;
    let simplifiedDenominator;

    if (coeffGCD > 1 ) {
        simplifiedNumerator = rationalizedNumerator.replace(/^\d+/, numCoefficient / coeffGCD);
        simplifiedDenominator = rationalizedDenominator.replace(/^\d+/, denomCoefficient / coeffGCD);

        steps.push(`Katsayılar sadeleştirilir: \\(\\frac{${rationalizedNumerator}}{${rationalizedDenominator}} = \\frac{${simplifiedNumerator}}{${simplifiedDenominator}}\\).`)

        simplifiedResult = `\\frac{${simplifiedNumerator}}{${simplifiedDenominator}}`;
    } else {
        simplifiedNumerator = rationalizedNumerator;
        simplifiedDenominator = rationalizedDenominator;
    }

    if (simplifiedDenominator === "1") {
        if (simplifiedNumerator.startsWith('1\\sqrt{') && simplifiedNumerator.endsWith('}')) {
            simplifiedNumerator = simplifiedNumerator.slice(1);
            steps.push(`Pay ve paydaki 1'ler atılır: \\(${simplifiedNumerator}\\)`);
        } else {
            steps.push(`Payda 1 olduğundan sadeleştirilmiş sonuç: \\(${simplifiedNumerator}\\).`);
        }

        simplifiedResult = `${simplifiedNumerator}`;
    }

    const approximate = (Math.sqrt(numerator) / Math.sqrt(denominator)).toFixed(4).replace(/\.?0+$/, '');

    const involvesSquareRoots = numRemain !== 1 || denomRemain !== 1;

    if (involvesSquareRoots) {
        steps.push(`Bu yüzden, \\(\\sqrt{\\frac{${numerator}}{${denominator}}} = ${simplifiedResult}\\) veya \\(≈${approximate}\\) olarak çıkar.`);
        resultElement.innerHTML = `\\(\\sqrt{\\frac{${numerator}}{${denominator}}} = ${simplifiedResult}\\), \\(≈${approximate}\\)`;
    } else {
        const originalFraction = `\\frac{${rationalizedNumerator}}{${rationalizedDenominator}}`;
        const simplifiedFraction = `\\frac{${simplifiedNumerator}}{${simplifiedDenominator}}`;

        if (originalFraction !== simplifiedFraction) {
            steps.push(`Bu yüzden, \\(\\sqrt{\\frac{${numerator}}{${denominator}}} = ${originalFraction}, (${simplifiedFraction})\\) veya \\(≈${approximate}\\) olarak çıkar.`);
            resultElement.innerHTML = `\\(\\sqrt{\\frac{${numerator}}{${denominator}}} = ${originalFraction}, ${simplifiedFraction}\\), \\(≈${approximate}\\)`;
        } else {
            steps.push(`Bu yüzden, \\(\\sqrt{\\frac{${numerator}}{${denominator}}} = ${originalFraction}\\) veya \\(≈${approximate}\\) olarak çıkar.`);
            resultElement.innerHTML = `\\(\\sqrt{\\frac{${numerator}}{${denominator}}} = ${originalFraction}\\), \\(≈${approximate}\\)`;
        }
    }

    steps.forEach(step => {
        const li = document.createElement('li');
        li.innerHTML = step;
        stepsList.appendChild(li);
    });

    MathJax.typesetPromise();
}

