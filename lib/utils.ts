export const isEqual = (a: unknown, b: unknown): boolean => {
    if (a === b) {
        return true;
    }
    if (typeof a !== "object" || typeof b !== "object") {
        return false;
    }
    if (a === null || b === null) {
        return false;
    }

    const keysA = Object.keys(a as object);
    const keysB = Object.keys(b as object);

    if (keysA.length !== keysB.length) {
        return false;
    }

    for (const key of keysA) {
        const valA = (a as Record<string, unknown>)[key];
        const valB = (b as Record<string, unknown>)[key];
        if (!keysB.includes(key) || !isEqual(valA, valB)) {
            return false;
        }
    }

    return true;
};
