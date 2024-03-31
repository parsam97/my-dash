function generateNormallyDistributedArray(sum, startWithOne = false, roundMethod = 'round') {
    const round = (num) => {
        if (roundMethod === 'floor') return Math.floor(num);
        if (roundMethod === 'ceil') return Math.ceil(num);
        return Math.round(num);
    };

    let array = [];
    let total = startWithOne ? sum - 1 : sum;

    // Generate normally distributed values
    while (total > 0) {
        let u = 0, v = 0;
        while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
        while (v === 0) v = Math.random();
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

        // Scale and shift the number to fit the desired range
        num = num * (total / 3) + (total / 2);
        num = round(num);

        if (num > 0 && num <= total) {
            array.push(num);
            total -= num;
        }
    }

    if (startWithOne) array.unshift(1);
    return array;
}