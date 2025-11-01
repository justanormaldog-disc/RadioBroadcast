export enum ColourCodes {
    YELLOW = 11,
    RED = 9,
    BLACK = 16,
    LIGHT_BLACK = 0,
    WHITE = 255,
    GREEN = 10,
}

/**
 * Resets all styles and modes
 */
export const reset = () => "\x1b[0m";

/**
 * Move cursor to begging of previous line
 */
export const prevline = () => "\x1b[#F";

/**
 * Erases the current line
 */
export const eraseline = () => "\x1b[2K";

/**
 * Saves the cursor's position.
 * 
 * Uses DEC standard.
 */
export const save = () => "\x1b7";

/**
 * Restores the cursor's position.
 * 
 * Uses DEC standard.
 */
export const restore = () => "\x1b8";

export const foreground = (code: ColourCodes): string => {
    return `\x1b[38;5;${code}m`;
}

export const background = (code: ColourCodes): string => {
    return `\x1b[48;5;${code}m`;
}