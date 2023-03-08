// Make Ten
// by Lucas

import { addUpdateListener } from './input.js';

const maxFactl = 16;
const main = (e) => {
    
    // Reset solutions
    const solutionsOld = document.getElementById('solutions');
    const solutions = solutionsOld.cloneNode(false);
    solutionsOld.parentNode.replaceChild(solutions, solutionsOld);
    // Invalid input
    if (e.invalid) {
        return;
    }

    // Divide and conquer - solve for segments of digits
    // Solve for increasing segment `length` (`end` - `start`)
    const size = e.inputs.length;
    const digits = e.inputs.map(intObject)
    const dp = initialise(size);
    window.dp = dp;
    
    for (let length = 0; length < size; length++) {
        for (let start = 0, end = length; end < size; start++, end++) {
            const cur = dp[start][end];
            if (start === end) {
                cur.add(digits[start], ['#', digits[start]]);
            }
            for (let mid = start; mid < end; mid++) {
                for (let a of dp[start][mid].keys()) {
                    for (let b of dp[mid+1][end].keys()) {
                        cur.add(a + b, ['+', mid, a, b]);
                        cur.add(a - b, ['-', mid, a, b]);
                        cur.add(a * b, ['*', mid, a, b]);
                        if (b != 0) {
                            cur.add(a / b, ['/', mid, a, b]);
                        }
                    }
                }
            }
            for (let c of cur.keys()) {
                if (Math.floor(c) === c) {
                    let f;
                    for (let n = c; n == 0 || 3 <= n && n <= maxFactl; n = f) {
                        f = factorial(n);
                        cur.add(f, ['!', n]);
                    }
                }
            }
        }
    }
    
    // Display solutions
    const solutionSet = traverse(dp, 0, size-1, e.target);
    for (let solution of solutionSet) {
        const display = document.createElement('div');
        display.innerText = solution + ' = ' + e.target;
        solutions.appendChild(display);
    }
    if (solutionSet.size === 0) {
        const display = document.createElement('div');
        display.innerText = 'No solutions';
        solutions.appendChild(display);
    }
};

// Retrieves solutions by recursively traversing a solution structure
const maxSolutions = 16;
const traverse = (dp, start, end, target, parent) => {
    const solutions = new Set();
    const cur = dp[start][end].get(target);
    if (cur === undefined) {
        return solutions;
    }
    // Apply brackets if operator is lower precedence than parent operator
    const precedence = {
        '!' : 4,
        '/(': 3, '/' : 2, '*(': 2, '*' : 2,
        '-(': 1, '-' : 0, '+(': 0, '+' : 0,
    }
    traversal:
    // Iterate over all possible last steps of reaching the current solution
    for (let ans of cur) {
        const operator = ans[0];
        switch (operator) {
            // The step used an input digit itself
            case '#':
                solutions.add(ans[1]);
                break;
            // The step used addition, subtraction, multiplication or division
            case '+': case '-': case '*': case '/':
                let b, brackets;
                const operatorB = operator + '(';
                // Iterate over possible solutions for obtaining both operands
                for (let a of traverse(dp, start, ans[1], ans[2], operator)) {
                    for (b of traverse(dp, ans[1]+1, end, ans[3], operatorB)) {
                        // Add to solution set
                        brackets = precedence[operator] < precedence[parent];
                        solutions.add(
                            (brackets ? '(' : '') +
                            a + ' ' + operator + ' ' + b +
                            (brackets ? ')' : '')
                        );
                        if (solutions.size === maxSolutions) {
                            break traversal;
                        }
                    }
                }
                break;
            // The step involved applying the factorial function
            case '!':
                // Iterate over possible solutions for obtaining `n`
                for (let n of traverse(dp, start, end, ans[1], operator)) {
                    // Add to solution set
                    solutions.add(n + operator);
                    if (solutions.size === maxSolutions) {
                        break traversal;
                    }
                }
                break;
        }
    }
    return solutions;
}

// Creates a solution structure
// Stores possible solutions for any given `segment` (`start` and `end` index)
const initialise = (n) => {
    const dp = new Array(n);
    for (let i = 0; i < n; i++) {
        dp[i] = new Array(n);
        for (let j = i; j < n; j++) {
            dp[i][j] = SetMap();
        }
    }
    return dp;
};

// Computes factorial values
const intObject = Number; // BigInt if no division
const f1 = intObject(1);
const fComputed = [f1, f1]
const factorial = (n) => {
    if (typeof fComputed[n] === 'undefined') {
        for (let i = intObject(fComputed.length); i <= n; i += f1) {
            fComputed[i] = i * fComputed[i-f1];
        }
    }
    return fComputed[n];
}
window.factorial = factorial;

// Stores solutions for a specific segment
// Map contains "solution: [derivations]" (e.g. "4: [2 * 2, 2 + 2]")
const SetMap = () => {
    const map = new Map();
    return {
        add: (key, data) => {
            if (map.get(key) === undefined) {
                map.set(key, []);
            }
            map.get(key).push(data);
        },
        get: (key) => {
            return map.get(key);
        },
        keys: () => {
            return map.keys();
        },
        [Symbol.iterator]: () => {
            return map[Symbol.iterator]();
        }
    }
}

addUpdateListener(main);
