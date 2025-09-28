/**
 * Stamp Combinations Module
 * Finds combinations of stamps that add up to a target postage rate value
 */

import { combRep } from './combRep.js';

/**
 * Finds all possible stamp combinations that sum to the target value
 * @param {Array} stamps - Array of available stamps
 * @param {number} targetValue - Target value in euros
 * @param {number} maxStamps - Maximum number of stamps allowed in combination (optional)
 * @param {number} overpayMargin - Maximum acceptable overpay in euros (optional, default 0.10)
 * @returns {Array} Array of valid combinations
 */
export function findStampCombinations(stamps, targetValue, maxStamps = null, overpayMargin = 0.10) {
    // Prepare stamps data - keep original values for accurate ITL calculations
    const availableStamps = stamps.map(stamp => {
        return {
            ...stamp,
            maxQuantity: stamp.n
        };
    }).filter(stamp => stamp.maxQuantity > 0);
    
    const validCombinations = [];
    const seenCombinations = new Set();
    
    // Determine maximum number of stamps to try (this is the total count of stamps in a combination)
    // Cap at 12 even if user requests more, to prevent performance issues
    const maxStampsToTry = Math.min(maxStamps || 8, 12);
    
    // Generate combinations for each length from 1 to maxStampsToTry
    for (let length = 1; length <= maxStampsToTry; length++) {
        const combinations = combRep(availableStamps, length);
        
        for (const combo of combinations) {
            // Count quantities of each unique stamp in this combination
            const stampCounts = {};
            let totalValueITL = 0;
            let totalValueEUR = 0;
            let isValidQuantity = true;
            
            // First pass: count quantities and calculate total value by currency
            combo.forEach(stamp => {
                const key = stamp.id;
                if (!stampCounts[key]) {
                    stampCounts[key] = {
                        id: stamp.id,
                        name: stamp.name,
                        value: stamp.value,
                        currency: stamp.currency,
                        quantity: 0,
                        availableQuantity: stamp.maxQuantity // Current stock available
                    };
                }
                stampCounts[key].quantity++;
                
                // Add to appropriate currency total
                if (stamp.currency === 'ITL') {
                    totalValueITL += stamp.value;
                } else if (stamp.euro_cents) {
                    totalValueEUR += stamp.euro_cents / 100;
                } else {
                    // Assume EUR currency
                    totalValueEUR += stamp.value;
                }
            });
            
            // Convert total ITL to EUR and combine with EUR total
            const totalValueFromITL = totalValueITL / 1936.27;
            const totalValue = totalValueEUR + totalValueFromITL;
            
            // Check if we have enough stamps of each type
            for (const stampCount of Object.values(stampCounts)) {
                if (stampCount.quantity > stampCount.availableQuantity) {
                    isValidQuantity = false;
                    break;
                }
            }
            
            // Skip if we don't have enough stamps of any type
            if (!isValidQuantity) {
                continue;
            }
            
            const roundedTotalValue = Math.round(totalValue * 100) / 100; // Round to 2 decimal places
            const roundedTargetValue = Math.round(targetValue * 100) / 100;
            
            // Check if combination meets criteria:
            // 1. Total value >= target value
            // 2. Total value <= target value + overpay margin
            if (roundedTotalValue >= roundedTargetValue && 
                roundedTotalValue <= roundedTargetValue + overpayMargin) {
                
                // Create combination object (remove availableQuantity from output)
                const combinationStamps = Object.values(stampCounts).map(({availableQuantity, ...stamp}) => stamp);
                
                // Create unique signature
                const signature = combinationStamps
                    .map(item => `${item.id}:${item.quantity}`)
                    .sort()
                    .join(',');
                
                if (!seenCombinations.has(signature)) {
                    seenCombinations.add(signature);
                    
                    validCombinations.push({
                        stamps: combinationStamps,
                        totalValue: roundedTotalValue,
                        totalValueEuros: roundedTotalValue,
                        totalStamps: combo.length,
                        overpay: Math.round((roundedTotalValue - roundedTargetValue) * 100) / 100
                    });
                }
            }
        }
        
        // Limit results to prevent excessive computation
        if (validCombinations.length >= 50) {
            break;
        }
    }
    
    // Sort by efficiency: least overpay first, then fewer total stamps, then fewer unique stamp types
    return validCombinations
        .sort((a, b) => {
            // First sort by overpay (less overpay is better)
            if (a.overpay !== b.overpay) {
                return a.overpay - b.overpay;
            }
            // Then by total stamps (fewer is better)
            if (a.totalStamps !== b.totalStamps) {
                return a.totalStamps - b.totalStamps;
            }
            // Finally by number of unique stamp types (fewer is better)
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
    const overpayText = combination.overpay > 0 ? ` +€${combination.overpay.toFixed(2)}` : '';
    
    return `${stampDescriptions.join(' + ')} = €${combination.totalValue.toFixed(2)}${overpayText} (${totalStamps} stamp${totalStamps === 1 ? '' : 's'})`;
}
