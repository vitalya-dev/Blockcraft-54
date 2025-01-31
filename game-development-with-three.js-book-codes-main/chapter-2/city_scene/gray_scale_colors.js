export default [
    '#202020',
    '#282828',
    '#303030',
    '#383838',
    '#404040',
    '#484848',
    '#505050',
    '#585858',
    '#606060',
    '#686868',
    '#707070',
    '#787878',
    '#888888',
    '#909090',
    '#989898',
    '#A0A0A0',
    '#A8A8A8',
    '#B0B0B0',
    '#B8B8B8'
]

export function generateRandomColorHex() {
    // return "#" + ("00000" + Math.floor(Math.random() * Math.pow(16, 6)).toString(16)).slice(-6);
    var value = Math.random() * 0xFF | 0;
    var grayscale = (value << 16) | (value << 8) | value;
    var color = '#' + grayscale.toString(16);
    return color;
    }