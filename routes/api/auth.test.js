const mongoose = require('mongoose');
const request = require('supertest');
require('dotenv').config();

const app = require('../../app');
const createHashPassword = require('../../helpers/createHashPassword');
const User = require('../../models/user.js');

mongoose.set('strictQuery', false);

const { MONGO_URI, PORT } = process.env;

describe('test auth routes', () => {
  let server;
  beforeAll(() => (server = app.listen(PORT)));
  afterAll(() => server.close());

  beforeEach(done => {
    mongoose.connect(MONGO_URI).then(() => done());
  });

  test('test signup route', async () => {
    const newUser = {
      email: 'milfHunter@mail.com',
      avatarURL: 'mockurl',
      password: 'qwerty',
    };

    const hashPassword = await createHashPassword(newUser.password);
    const user = await User.create({ ...newUser, password: hashPassword });

    const loginUser = {
      email: 'milfHunter@mail.com',
      password: 'qwerty',
    };

    const response = await request(app)
      .post('/api/users/login')
      .send(loginUser);

    expect(response.statusCode).toBe(200);
    const { body } = response;
    expect(body.token).toBeTruthy();
    const { token, email, subscription } = await User.findById(user._id);
    expect(body.token).toBe(token);
    expect(typeof email === 'string').toBe(true);
    expect(typeof subscription === 'string').toBe(true);

    await User.findByIdAndDelete(user._id);
  });
});
