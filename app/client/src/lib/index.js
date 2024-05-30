export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms * 1000));

export const wrapTextWithTag = (str, start_char, end_char, tag) => {
    return `${str.substring(0, start_char)}<${tag}>${str.substring(start_char, end_char)}</${tag}>${str.substring(end_char)}`;
};

export const shuffleArray = (array) => {
    let currentIndex = array.length,
        temporaryValue,
        randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
};
