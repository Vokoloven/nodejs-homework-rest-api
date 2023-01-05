const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authorize = require('../../middlewares/authorize');
const upload = require('../../middlewares/uploader');
const path = require('path');
const fs = require('fs/promises');
const Jimp = require('jimp');
const { nanoid } = require('nanoid');
const sendMail = require('../../helpers/mail.js');

const gravatar = require('gravatar');

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

const verifyUserSchema = Joi.object({
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
    const avatarURL = gravatar.url(email);

    const verificationToken = nanoid();

    const newUser = await User.create({
      avatarURL,
      email,
      password: hashedPassword,
      verificationToken,
    });

    const mail = {
      to: 'vokolovens@gmail.com',
      subject: 'Email verification',
      html: `<a href='http://localhost:3000/api/users/verify/${verificationToken}'>Verify User</a>`,
    };

    await sendMail(mail);

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

    if (!user.verificationToken) {
      throw createError(401, 'User nor verified');
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

router.patch('/', authorize, async (req, res, next) => {
  try {
    const { _id, token } = req.user;

    const result = await User.findByIdAndUpdate(_id, req.body, { new: true });

    const { subscription } = result;

    if (!token) {
      throw createError(401, 'Not authorized');
    }

    res.status(201).json({ subscription });
  } catch (error) {
    next(error);
  }
});

router.patch(
  '/avatars',
  authorize,
  upload.single('avatar'),
  async (req, res, next) => {
    try {
      const { _id } = req.user;
      const { token } = req.user;

      const { path: tempDir, originalname } = req.file;

      const [extension] = originalname.split('.').reverse();
      const newName = `${_id}.${extension}`;
      const uploadDir = path.join(
        __dirname,
        '../../',
        'public',
        'avatars',
        newName
      );

      await fs.rename(tempDir, uploadDir);
      const avatarURL = path.join('avatars', newName);

      Jimp.read(uploadDir, (err, image) => {
        if (err) throw err;
        image.resize(250, 250).write(uploadDir);
      });

      await User.findByIdAndUpdate(_id, { avatarURL });
      res.status(200).json(avatarURL);

      if (!token) {
        throw createError(401, { message: 'Not authorized' });
      }
    } catch (error) {
      await fs.unlink(req.file.path);
      next(error);
    }
  }
);

router.get('/verify/:verificationToken', async (req, res, next) => {
  try {
    const { verificationToken } = req.params;

    const user = await User.findOne({ verificationToken });

    if (!user) {
      throw createError(404, 'User not found');
    }

    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: null,
    });

    res.status(200, { message: 'Verification successful' });
  } catch (error) {
    next(error);
  }
});

router.post('/verify', async (req, res, next) => {
  try {
    const { error } = verifyUserSchema.validate(req.body);
    if (error) {
      throw createError(400, error.message);
    }

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw createError(404, 'User not found');
    }

    if (user.verify) {
      throw createError(400, 'Verification has already been passed');
    }

    const mail = {
      to: 'vokolovens@gmail.com',
      subject: 'Email verification',
      html: `<a href='http://localhost:3000/api/users/verify/${user.verificationToken}'>Verify User</a>`,
    };

    await sendMail(mail);

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
