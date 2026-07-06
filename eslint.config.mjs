import { lintConfig } from 'tsm-utils/lint';

const newConfig = lintConfig.map(rule => ({
  ...rule,
  ignores: ['dist/infrastructure/database/migrations/**'],
}));

export default [
  ...newConfig,
  {
    rules: {
      'consistent-type-imports': 'off',
      'ts/consistent-type-imports': 'off',
    },
  },
];
