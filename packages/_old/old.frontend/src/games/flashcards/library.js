export const FLASHCARDS_QUEUE_SIZE = 5;

const TAB_THRESHOLD = 50;
const HORIZONTAL_BIAS = 1.3;

export function determineDirection(xstart, ystart, xend, yend) {
    const dx = xend - xstart;
    const dy = yend - ystart;
    const distance = Math.sqrt(dx * dx + dy * dy); // Calculate the Euclidean distance

    if (distance < TAB_THRESHOLD) {
        return "tap";
    } else {
        if (Math.abs(dx) * HORIZONTAL_BIAS > Math.abs(dy)) {
            return dx > 0 ? "right" : "left";
        } else {
            return dy > 0 ? "down" : "up";
        }
    }
}
