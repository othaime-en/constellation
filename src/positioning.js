function calculateStarPositions(contributions, canvasWidth, canvasHeight) {
    const stars = [];

    // Find year boundaries from the data
    const dates = contributions.map(c => new Date(c.date));
    const yearStart = new Date(Math.min(...dates));
    const yearEnd = new Date(Math.max(...dates));
    const totalDays = Math.ceil((yearEnd - yearStart) / (1000 * 60 * 60 * 24));

    contributions.forEach(contribution => {
        if (contribution.count === 0) return;

        const date = new Date(contribution.date);

        // X-axis: Day progression through the year
        const dayOfYear = Math.floor((date - yearStart) / (1000 * 60 * 60 * 24));
        const xBase = (dayOfYear / totalDays) * canvasWidth;

        // Add slight horizontal jitter for organic feel
        const hourJitter = (Math.random() - 0.5) * 0.04 * canvasWidth;
        const x = Math.max(10, Math.min(canvasWidth - 10, xBase + hourJitter));

        // Y-axis: Random with slight clustering
        const yBase = Math.random() * canvasHeight;
        const clusterJitter = (Math.random() - 0.5) * 0.1 * canvasHeight;
        const y = Math.max(10, Math.min(canvasHeight - 10, yBase + clusterJitter));

        const size = calculateStarSize(contribution.count);
        const brightness = calculateBrightness(contribution.count);

        stars.push({
            x,
            y,
            size,
            brightness,
            count: contribution.count,
            date: contribution.date
        });
    });

    return stars;
}

function calculateStarSize(count) {
    // Logarithmic scaling: 1.5px to 6px radius
    const minSize = 1.5;
    const maxSize = 6;
    const logCount = Math.log(count + 1);
    const maxLogCount = Math.log(50); // Normalize to 50+ contributions

    return minSize + (Math.min(logCount / maxLogCount, 1)) * (maxSize - minSize);
}

function calculateBrightness(count) {
    // Logarithmic opacity: 0.4 to 1.0
    const minOpacity = 0.4;
    const maxOpacity = 1.0;
    const logCount = Math.log(count + 1);
    const maxLogCount = Math.log(50);

    return minOpacity + (Math.min(logCount / maxLogCount, 1)) * (maxOpacity - minOpacity);
}

module.exports = { calculateStarPositions };