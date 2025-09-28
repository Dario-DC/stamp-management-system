/**
 * Stamp Combinations Module
 * Finds combinations of stamps that add up to a target postage rate value
 */

/**
 * Finds all possible stamp combinations that sum to the target value
 * @param {Array} stamps - Array of available stamps
 * @param {number} targetValue - Target value in euros
 * @returns {Array} Array of valid combinations
 */
export function findStampCombinations(stamps, targetValue) {
    // Convert target to cents for precise calculation
    const targetCents = Math.round(targetValue * 100);
    
    // Prepare stamps data with converted values
    const availableStamps = stamps.map(stamp => {
        let valueInCents;
        
        if (stamp.currency === 'ITL') {
            // Convert Italian Lire to euros then to cents
            valueInCents = Math.round((stamp.value / 1936.27) * 100);
        } else if (stamp.euro_cents) {
            // Use pre-calculated euro_cents if available
            valueInCents = stamp.euro_cents;
        } else {
            // Assume EUR currency
            valueInCents = Math.round(stamp.value * 100);
        }
        
        return {
            ...stamp,
            valueInCents,
            maxQuantity: stamp.n
        };
    }).filter(stamp => stamp.valueInCents > 0 && stamp.maxQuantity > 0);
    
    const validCombinations = [];
    const seenCombinations = new Set();
    
    // Use dynamic programming approach to find combinations
    function findCombinations(stampIndex, remainingCents, currentCombination) {
        // Base case: exact match
        if (remainingCents === 0) {
            if (currentCombination.length > 0) {
                // Create a unique signature for this combination
                const signature = currentCombination
                    .map(item => `${item.id}:${item.quantity}`)
                    .sort()
                    .join(',');
                
                if (!seenCombinations.has(signature)) {
                    seenCombinations.add(signature);
                    
                    const totalStamps = currentCombination.reduce((sum, item) => sum + item.quantity, 0);
                    validCombinations.push({
                        stamps: currentCombination.map(item => ({ ...item })),
                        totalValue: targetCents,
                        totalValueEuros: targetCents / 100,
                        totalStamps
                    });
                }
            }
            return;
        }
        
        // Base case: no more stamps or negative remaining
        if (stampIndex >= availableStamps.length || remainingCents < 0) {
            return;
        }
        
        // Stop if we have too many combinations already
        if (validCombinations.length >= 30) {
            return;
        }
        
        const stamp = availableStamps[stampIndex];
        const maxUsable = Math.min(
            stamp.maxQuantity,
            Math.floor(remainingCents / stamp.valueInCents)
        );
        
        // Try using 0 to maxUsable of this stamp
        for (let quantity = 0; quantity <= maxUsable; quantity++) {
            if (quantity > 0) {
                currentCombination.push({
                    id: stamp.id,
                    name: stamp.name,
                    value: stamp.value,
                    currency: stamp.currency,
                    valueInCents: stamp.valueInCents,
                    quantity: quantity
                });
            }
            
            findCombinations(
                stampIndex + 1,
                remainingCents - (stamp.valueInCents * quantity),
                currentCombination
            );
            
            if (quantity > 0) {
                currentCombination.pop();
            }
        }
    }
    
    findCombinations(0, targetCents, []);
    
    // Sort by efficiency: fewer total stamps first, then fewer unique stamp types
    return validCombinations
        .sort((a, b) => {
            if (a.totalStamps !== b.totalStamps) {
                return a.totalStamps - b.totalStamps;
            }
            return a.stamps.length - b.stamps.length;
        })
        .slice(0, 15); // Limit to top 15 most efficient combinations
}



/**
 * Format a stamp combination for display
 * @param {Object} combination - Combination object
 * @returns {string} Formatted string representation
 */
export function formatCombination(combination) {
    const stampDescriptions = combination.stamps.map(stamp => {
        if (stamp.quantity === 1) {
            return stamp.name;
        } else {
            return `${stamp.quantity}x ${stamp.name}`;
        }
    });
    
    const totalStamps = combination.stamps.reduce((sum, stamp) => sum + stamp.quantity, 0);
    
    return `${stampDescriptions.join(' + ')} (${totalStamps} stamp${totalStamps === 1 ? '' : 's'})`;
}
