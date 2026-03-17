import { lintConfig } from 'tsm-utils/lint';

export default [
  ...lintConfig,
  {
    rules: {
      'consistent-type-imports': 'off',
      'ts/consistent-type-imports': 'off',
    },
  },
];
