const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authorize = require('../../middlewares/authorize');

const User = require('../../models/user.js');
const createHashPassword = require('../../helpers/createHashPassword');

const Joi = require('joi');

const { createError } = require('../../helpers');

const registerUserSchema = Joi.object({
  password: Joi.string().min(6).required(),

  email: Joi.string()
    .pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
    .required(),

  subscription: Joi.string().required(),
});

const loginUserSchema = Joi.object({
  password: Joi.string().min(6).required(),
  email: Joi.string()
    .pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
    .required(),
});

const SECRET_KEY = String(process.env.SECRET_KEY);

const router = express.Router();

router.post('/signup', async (req, res, next) => {
  try {
    const { error } = registerUserSchema.validate(req.body);
    if (error) {
      throw createError(400, error.message);
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      throw createError(409, 'Email in use');
    }

    const hashedPassword = await createHashPassword(password);

    const newUser = await User.create({ email, password: hashedPassword });

    res.status(201).json({ email: newUser.email });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { error } = loginUserSchema.validate(req.body);
    if (error) {
      throw createError(400, error.message);
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw createError(401, 'Email or password is wrong');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw createError(401, 'Email or password is wrong');
    }

    const payload = { id: user._id };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });

    await User.findByIdAndUpdate({ _id: user._id }, { token });

    res.json({ token });
  } catch (error) {
    next(error);
  }
});

router.get('/logout', authorize, async (req, res, next) => {
  try {
    const { _id } = req.user;

    await User.findByIdAndUpdate(_id, { token: '' });
    res.json({ message: 'Logout successfully' });
  } catch (error) {
    next(error);
  }
});

router.get('/current', authorize, async (req, res, next) => {
  try {
    const { token, email, subscription } = req.user;

    if (!token) {
      throw createError(401, 'Not authorized');
    }

    res.status(200).json({ email, subscription });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
