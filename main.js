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
    let i, solution;
    for (i = 0; solution = traverse(dp, 0, size-1, e.target, true, i); i++) {
        const display = document.createElement('div');
        display.innerText = solution + ' = ' + e.target;
        solutions.appendChild(display);
    }
    if (i === 0) {
        const display = document.createElement('div');
        display.innerText = 'No solutions';
        solutions.appendChild(display);
    }
};

// Retrieves solutions by recursively traversing a solution structure
const traverse = (dp, start, end, target, head, i) => {
    const cur = dp[start][end].get(target);
    if (cur === undefined) {
        return false;
    }
    const ans = cur[i || 0];
    if (ans === undefined) {
        return false;
    }
    switch (ans[0]) {
        case '#':
            return ans[1];
        case '+': case '-': case '*': case '/':
            return (head ? '' : '(') +
                    traverse(dp, start, ans[1], ans[2]) +
                    ' ' + ans[0] + ' ' +
                    traverse(dp, ans[1]+1, end, ans[3]) +
                   (head ? '' : ')');
        case '!':
            return traverse(dp, start, end, ans[1]) + '!';
        default:
            return;
    }
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
