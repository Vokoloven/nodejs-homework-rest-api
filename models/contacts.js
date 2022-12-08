const fs = require('fs').promises;
const path = require('path');
const contactsPath = path.join(__dirname, 'contacts.json');
const ObjectID = require('bson-objectid');

const listContacts = async () => {
  const result = await fs.readFile(contactsPath, err => {
    if (err) return err.message;
  });
  return JSON.parse(result);
};

const getContactById = async contactId => {
  const result = await fs.readFile(contactsPath, err => {
    if (err) return err.message;
  });
  const parsedContactsList = JSON.parse(result);
  const findedContact = parsedContactsList.find(
    i => i.id === String(contactId)
  );

  if (!findedContact) {
    return null;
  }

  return findedContact;
};

const addContact = async (name, email, phone) => {
  const result = await fs.readFile(contactsPath, err => {
    if (err) return err.message;
  });
  const parsedContactsList = JSON.parse(result);
  const contact = { id: String(ObjectID.index), name, email, phone };
  parsedContactsList.push(contact);
  await fs.writeFile(contactsPath, JSON.stringify(parsedContactsList), err => {
    if (err) return err.message;
  });
  return parsedContactsList;
};

const removeContact = async contactId => {
  const result = await fs.readFile(contactsPath, err => {
    if (err) return err.message;
  });
  const parsedContactsList = JSON.parse(result);
  const index = parsedContactsList.findIndex(i => i.id === String(contactId));
  if (index === -1) {
    return null;
  }
  const [removedContact] = parsedContactsList.splice(index, 1);
  await fs.writeFile(contactsPath, JSON.stringify(parsedContactsList));
  return removedContact;
};

const updateContact = async (contactId, body) => {
  const result = await fs.readFile(contactsPath, err => {
    if (err) return err.message;
  });

  const parsedContactsList = JSON.parse(result);
  const index = parsedContactsList.findIndex(i => i.id === String(contactId));
  if (index === -1) {
    return null;
  }

  parsedContactsList[index] = {
    contactId,
    ...body,
  };

  await fs.writeFile(contactsPath, JSON.stringify(parsedContactsList), err => {
    if (err) return err.message;
  });
  return parsedContactsList[index];
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
