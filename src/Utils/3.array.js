export default {
    setback: (array) => {
        const lastSeen = new Map();
        for (let i = 0; i < array.length; i++) {
            lastSeen.set(array[i], i);
        }
        return array.filter((item, index) => lastSeen.get(item) === index);
    }
}