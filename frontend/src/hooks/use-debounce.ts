import { useState, useEffect } from "react";

/**
 * useDebounce — Delays updating a value until after a specified delay.
 * 
 * Use this to avoid firing expensive operations (API calls, URL updates)
 * on every keystroke. The returned value only updates once the user
 * stops changing the input for `delay` milliseconds.
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 400ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
