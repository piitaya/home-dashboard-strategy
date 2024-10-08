export const arrayDiff = <T extends any>(arr1: T[], arr2: T[]): T[] => {
  if (arr2.length === 0) {
    return arr1;
  }
  return arr1.filter((id) => !arr2.includes(id));
};
