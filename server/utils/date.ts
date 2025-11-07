export function getMoscowDayStart(inputDate: Date = new Date()): Date {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Moscow',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    const [year, month, day] = formatter
        .format(inputDate)
        .split('-')
        .map(Number);

    return new Date(Date.UTC(year, month - 1, day));
}

