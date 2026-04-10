function createRandomHex(length = 1) {
  let result = '';
  for (let index = 0; index < length; index += 1) {
    result += Math.floor(Math.random() * 16).toString(16);
  }
  return result;
}

export function generateUuid() {
  const segments = [8, 4, 4, 4, 12];
  return segments
    .map((length, index) => {
      const segment = createRandomHex(length);
      if (index === 2) {
        return `4${segment.slice(1)}`;
      }
      if (index === 3) {
        const variant = (8 + Math.floor(Math.random() * 4)).toString(16);
        return `${variant}${segment.slice(1)}`;
      }
      return segment;
    })
    .join('-');
}

