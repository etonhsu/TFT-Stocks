export const formatDate = (dateInput: string | number | Date) => {
    let date: Date;
    if (typeof dateInput === 'string') {
        // Parse the date string correctly, considering it might be in ISO format
        date = new Date(dateInput);
    } else {
        date = new Date(dateInput);
    }
    return date.toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};
