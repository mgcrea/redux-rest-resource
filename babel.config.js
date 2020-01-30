module.exports = {
  presets: ['@babel/preset-typescript', '@babel/preset-react', '@babel/preset-env'],
  plugins: [
    [
      'babel-plugin-module-name-mapper',
      {
        moduleNameMapper: {
          '^src/(.*)': '<rootDir>/src/$1'
        }
      }
    ],
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-runtime'
  ]
};
