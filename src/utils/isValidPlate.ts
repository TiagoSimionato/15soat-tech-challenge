export const isValidPlate = (placa: string): boolean => {
  const plateRegex = /^[a-z]{3}\d{4}$/i;
  const MercosulCarRegex = /^[a-z]{3}\d[a-z]\d{2}$/i;
  const MercosulMotorcycleRegex = /^[a-z]{3}\d{2}[a-z]\d$/i;

  return plateRegex.test(placa) || MercosulCarRegex.test(placa) || MercosulMotorcycleRegex.test(placa);
};
