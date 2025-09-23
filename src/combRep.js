/**
 * Generate combinations with repetition from an array
 * Based on: https://stackoverflow.com/questions/32543936/combination-with-repetition
 * 
 * @param {Array} arr - The array to generate combinations from
 * @param {number} l - Length of the combinations (defaults to arr.length)
 * @returns {Array<Array>} Array of all possible combinations with repetition
 */
function combRep(arr, l) {
    if (l === void 0) l = arr.length; // Length of the combinations
    var data = Array(l), // Used to store state
        results = []; // Array of results
    (function f(pos, start) {
        // Recursive function
        if (pos === l) {
            // End reached
            results.push(data.slice()); // Add a copy of data to results
            return;
        }
        for (var i = start; i < arr.length; ++i) {
            data[pos] = arr[i]; // Update data
            f(pos + 1, i); // Call f recursively
        }
    })(0, 0); // Start at index 0
    return results; // Return results
}

export { combRep };