import { describe, expect, it } from '@jest/globals';
import { isValidPlate } from '../modules/vehicle/utils/isValidPlate';

describe('isValidPlate', () => {
  it('should identify old standard plates', () => {
    expect(isValidPlate('ABC1234')).toEqual(true);
  });
  it('should identify mercosul car plates', () => {
    expect(isValidPlate('ABC12D5')).toEqual(true);
  });
  it('should identify mercosul motorcycle plates', () => {
    expect(isValidPlate('ABC1D15')).toEqual(true);
  });
  it('should reject other standards', () => {
    expect(isValidPlate('ABC12356')).toEqual(false);
    expect(isValidPlate('ABC12D51')).toEqual(false);
  });
});
