export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms * 1000));

export const wrapTextWithTag = (str, start_char, end_char, tag) => {
    return `${str.substring(0, start_char)}<${tag}>${str.substring(start_char, end_char)}</${tag}>${str.substring(end_char)}`;
};
