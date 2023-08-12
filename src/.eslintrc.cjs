/* eslint-env node */
module.exports = {
  env: {
    browser: true,
    es6: true
  },
  // - extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 13,
    ecmaFeatures: {
      globalReturn: true
    },
    sourceType: 'module'
  },
  rules: {
    'no-console': 'off',
    'indent': [
      'error',
      2,
      { SwitchCase: 1 }
    ],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'eqeqeq': ['error', 'always'],
    'no-var': [1],
    'brace-style': ['error', 'stroustrup'],
    'no-useless-escape': 'off',
    'quote-props': [2, 'consistent-as-needed'],
    'space-before-blocks': ['error', 'always'],
    'arrow-spacing': ['error'],
    'no-constructor-return': ['error'],
    'no-unused-private-class-members': ['error'],
    'capitalized-comments': ['error'],
    'curly': ['error', 'all'],
    'no-empty-function': ['error'],
    'no-implicit-globals': ['error'],
    'no-implicit-coercion': ['error'],
    'no-invalid-this': ['error'],
    'no-labels': ['error'],
    'no-lonely-if': ['error'],
    /* 'no-magic-numbers': ['error', { ignore: [0, 1, -1, 2], ignoreDefaultValues: true, ignoreClassFieldInitialValues: true }],*/ // Disabling this rule because there's no exception for function calls (leads to redundant code declaring constants with the same name specified by the parameter)
    'no-mixed-operators': ['error'],
    'no-multi-assign': ['error'],
    'no-return-assign': ['error'],
    'no-sequences': ['error'],
    'no-undef-init': ['error'],
    'no-undefined': ['error'],
    'no-unneeded-ternary': ['error'],
    'no-unused-expressions': ['error'],
    'no-useless-call': ['error'],
    'no-useless-constructor': ['error'],
    'no-useless-return': ['error'],
    'no-useless-concat': ['error'],
    'no-void': ['error'],
    'one-var': ['error', 'never'],
    'prefer-const': ['error'],
    'prefer-object-spread': ['error'],
    'prefer-regex-literals': ['error'],
    'prefer-rest-params': ['error'],
    'prefer-spread': ['error'],
    'prefer-template': ['error'],
    'require-await': ['error'],
    'spaced-comment': ['error'],
    'yoda': ['error'],
    'array-bracket-spacing': ['error', 'never'],
    'arrow-parens': ['error', 'as-needed'],
    'comma-spacing': ['error'],
    'func-call-spacing': ['error', 'never'],
    'keyword-spacing': ['error', {
      overrides: {
        if: { after: false },
        for: { after: false },
        catch: { after: false },
        switch: { after: false }
      }
    }],
    'space-before-function-paren': ['error', { anonymous: 'never', named: 'never', asyncArrow: 'always' }],
    '@typescript-eslint/type-annotation-spacing': ['error', { after: true }]
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true
};
