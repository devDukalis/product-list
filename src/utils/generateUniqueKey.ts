export const generateUniqueKey = () => {
  return window.self.crypto.randomUUID();
};
