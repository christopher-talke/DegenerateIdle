function getCurrentTimestamp(): string {
    const now = new Date();

    const rawHours = now.getHours();
    const rawMinutes = now.getMinutes();
    const rawSeconds = now.getSeconds();
    const timestring = now.toTimeString();
    const timezone = timestring
        .slice(timestring.indexOf('('))
        .replace(/[\(\)]/gi, '')
        .split(' ')
        .map((l) => l[0])
        .join('');

    const hours = rawHours > 9 ? rawHours : `0${rawHours}`;
    const minutes = rawMinutes > 9 ? rawMinutes : `0${rawMinutes}`;
    const seconds = rawSeconds > 9 ? rawSeconds : `0${rawSeconds}`;

    return `${hours}:${minutes}:${seconds} (${timezone})`;
}

export { getCurrentTimestamp };
