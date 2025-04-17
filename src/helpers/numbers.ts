export const prettyNumber = (num?: number) => {
    if (!num) return '0';
    return num.toLocaleString('en-US', {
        maximumFractionDigits: 2,
        notation: 'compact',
        compactDisplay: 'short'
    });
}