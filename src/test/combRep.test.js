import { describe, it, expect } from "vitest";
import { combRep } from "../combRep.js";

describe("combRep - Combinations with Repetition", () => {
    it("should generate correct combinations for [a,b,c] with length 2", () => {
        const result = combRep(["a", "b", "c"], 2);
        const expected = [
            ["a", "a"],
            ["a", "b"], 
            ["a", "c"],
            ["b", "b"],
            ["b", "c"],
            ["c", "c"]
        ];
        
        expect(result).toHaveLength(6);
        
        // Check that all expected combinations are present
        expected.forEach(expectedCombo => {
            expect(result).toContainEqual(expectedCombo);
        });
        
        // Check that no unexpected combinations are present
        result.forEach(actualCombo => {
            expect(expected).toContainEqual(actualCombo);
        });
    });

    it("should generate correct combinations for numbers [1,2,3] with length 2", () => {
        const result = combRep([1, 2, 3], 2);
        const expected = [
            [1, 1],
            [1, 2],
            [1, 3],
            [2, 2],
            [2, 3],
            [3, 3]
        ];
        
        expect(result).toHaveLength(6);
        expected.forEach(expectedCombo => {
            expect(result).toContainEqual(expectedCombo);
        });
    });

    it("should handle single element array", () => {
        const result = combRep(["x"], 2);
        expect(result).toEqual([["x", "x"]]);
    });

    it("should handle length 1", () => {
        const result = combRep(["a", "b", "c"], 1);
        const expected = [["a"], ["b"], ["c"]];
        
        expect(result).toHaveLength(3);
        expected.forEach(expectedCombo => {
            expect(result).toContainEqual(expectedCombo);
        });
    });

    it("should handle length 3", () => {
        const result = combRep(["a", "b"], 3);
        const expected = [
            ["a", "a", "a"],
            ["a", "a", "b"],
            ["a", "b", "b"],
            ["b", "b", "b"]
        ];
        
        expect(result).toHaveLength(4);
        expected.forEach(expectedCombo => {
            expect(result).toContainEqual(expectedCombo);
        });
    });

    it("should use array length as default when l parameter is not provided", () => {
        const result = combRep(["a", "b"]);
        const expected = [
            ["a", "a"],
            ["a", "b"],
            ["b", "b"]
        ];
        
        expect(result).toHaveLength(3);
        expected.forEach(expectedCombo => {
            expect(result).toContainEqual(expectedCombo);
        });
    });

    it("should handle empty array", () => {
        const result = combRep([], 2);
        expect(result).toEqual([]);
    });

    it("should handle length 0", () => {
        const result = combRep(["a", "b", "c"], 0);
        expect(result).toEqual([[]]);
    });

    it("should work with mixed data types", () => {
        const result = combRep([1, "a", true], 2);
        
        expect(result).toHaveLength(6);
        expect(result).toContainEqual([1, 1]);
        expect(result).toContainEqual([1, "a"]);
        expect(result).toContainEqual([1, true]);
        expect(result).toContainEqual(["a", "a"]);
        expect(result).toContainEqual(["a", true]);
        expect(result).toContainEqual([true, true]);
    });

    it("should maintain order (combinations should be in non-decreasing order based on original array)", () => {
        const result = combRep(["x", "y", "z"], 2);
        
        // First combination should be [x, x]
        expect(result[0]).toEqual(["x", "x"]);
        
        // Each combination should be in non-decreasing order relative to original array indices
        result.forEach(combo => {
            const originalIndices = combo.map(item => ["x", "y", "z"].indexOf(item));
            for (let i = 1; i < originalIndices.length; i++) {
                expect(originalIndices[i]).toBeGreaterThanOrEqual(originalIndices[i - 1]);
            }
        });
    });
});