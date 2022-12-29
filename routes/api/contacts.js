const express = require('express');

const Contact = require('../../models/contact');

const Joi = require('joi');

const { createError } = require('../../helpers/');
const authorize = require('../../middlewares/authorize');

const contactsSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean(),
});

const updateFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required(),
});

const router = express.Router();

router.get('/', authorize, async (req, res, next) => {
  const { page, limit } = req.query;

  try {
    const { _id: owner } = req.user;

    const result = await Contact.find({ owner })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:contactId', authorize, async (req, res, next) => {
  try {
    const { contactId } = req.params;

    const result = await Contact.findById(contactId);
    if (!result) {
      throw createError(404, 'Not found');
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/', authorize, async (req, res, next) => {
  try {
    const { _id: owner } = req.user;

    const { error } = contactsSchema.validate(req.body);

    if (error) {
      throw createError(400, error.message);
    }

    const result = await Contact.create({ ...req.body, owner });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.delete('/:contactId', authorize, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await Contact.findByIdAndRemove(contactId);
    if (!result) {
      throw createError(404, 'Not found');
    }
    res.status(200).json({ message: 'Successfully deleted contact' });
  } catch (error) {
    next(error);
  }
});

router.put('/:contactId', authorize, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { error } = contactsSchema.validate(req.body);

    if (error) {
      throw createError(400, error.message);
    }

    const result = await Contact.findByIdAndUpdate(contactId, req.body, {
      new: true,
    });

    if (!result) {
      throw createError(404, 'Not found');
    }

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.patch('/:contactId/favorite', authorize, async (req, res, next) => {
  try {
    const { error } = updateFavoriteSchema.validate(req.body);

    if (error) {
      throw createError(400, error.message);
    }

    const { contactId } = req.params;

    const result = await Contact.findByIdAndUpdate(contactId, req.body, {
      new: true,
    });

    if (!result) {
      throw createError(404, 'Not found');
    }

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
