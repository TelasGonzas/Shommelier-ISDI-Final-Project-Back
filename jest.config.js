/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['dist', 'node_modules'],
  resolver: 'jest-ts-webcompat-resolver',
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: [
    'index.ts',
    'src/db/db.connect.ts',
    'src/app.ts',
    'src/config.ts',
    'src/routers/sneaker.router.ts',
    'src/routers/user.router.ts',
    'src/repository/user.model.ts',
    'src/repository/sneaker.model.ts',
    'src/controllers/controller.ts',
    'src/middleware/files.ts',
  ],
};
