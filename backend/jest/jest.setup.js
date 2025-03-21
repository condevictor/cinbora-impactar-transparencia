// jest/jest.setup.js
jest.mock('@shared/redisClient', () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    // outros métodos que você usa
  }
}));

// Se precisar fazer setup adicional para módulos ESM
jest.mock('mime', () => ({
  getType: jest.fn().mockImplementation(file => {
    if (file.endsWith('.png')) return 'image/png';
    if (file.endsWith('.jpg') || file.endsWith('.jpeg')) return 'image/jpeg';
    if (file.endsWith('.pdf')) return 'application/pdf';
    return 'application/octet-stream';
  }),
  getExtension: jest.fn().mockImplementation(type => {
    if (type === 'image/png') return 'png';
    if (type === 'image/jpeg') return 'jpg';
    if (type === 'application/pdf') return 'pdf';
    return 'bin';
  })
}));