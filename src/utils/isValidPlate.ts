export const isValidPlate = (placa: string): boolean => {
  const plateRegex = /^[a-z]{3}\d{4}$/i;
  const mercosulCarRegex = /^[a-z]{3}\d[a-z]\d{2}$/i;
  const mercosulMotorcycleRegex = /^[a-z]{3}\d{2}[a-z]\d$/i;

  return plateRegex.test(placa) || mercosulCarRegex.test(placa) || mercosulMotorcycleRegex.test(placa);
};
