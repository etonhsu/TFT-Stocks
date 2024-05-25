export const formatCurrency = (value: number, type: number): JSX.Element | string => {
    if (value === undefined || value === null) {
        return 'N/A';  // Or any other placeholder you prefer
    }

    if (type === 1) {
        const sign = value >= 0 ? '+' : '-';
        const color = value >= 0 ? '#82ca9d' : '#f44336';
        // Use toLocaleString to format the number with commas
        const formattedValue = Math.abs(value).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return <span style={{ color }}>{sign}${formattedValue}</span>;
    } else {
        const color = '#EAEAEA'
        // Use toLocaleString to format the number with commas
        const formattedValue = `$${value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
        return <span style={{color}}>{formattedValue}</span>;
    }
};