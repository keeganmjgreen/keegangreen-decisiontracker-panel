export function getExactlyOne<Type>(array: Type[]) {
  if (array.length !== 1) {
    throw Error('The array must contain exactly one element.');
  }
  return array[0];
}
