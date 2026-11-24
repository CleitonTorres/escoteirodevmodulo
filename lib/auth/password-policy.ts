const minLength = 8;
const maxLength = 128;
const symbols = "!@#$%&*?._-+=";

export const passwordHint = `Use de ${minLength} a ${maxLength} caracteres, com pelo menos uma letra, um número e um destes símbolos: ${symbols}`;

export function isValidNewPassword(password: string) {
  if (password.length > maxLength * 2) return false;

  const characters = Array.from(password);
  return characters.length >= minLength && characters.length <= maxLength &&
    /\p{L}/u.test(password) && /\p{Nd}/u.test(password) &&
    characters.some((character) => symbols.includes(character));
}
