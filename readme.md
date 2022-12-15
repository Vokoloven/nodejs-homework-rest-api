Documentation:

That is the simple API base for contacts. For DB used MangoDB + mongoose. For
sending CRUD, used POSTMAN.

---For start server with nodemon use: npm run start:dev

Schema of contacts obj: { "\_id": { "$oid": "639a010a9e375c1f6364ff10" },
"name": "Chaim Lewis", "email": "dui.in@egetlacus.ca", "phone": "(294)
840-6685", "favorite": true }

---GET http://localhost:3000/api/contacts/

---GET by ID http://localhost:3000/api/contacts/{:id}

---POST http://localhost:3000/api/contacts/

---DELETE http://localhost:3000/api/contacts/{:id}

---PUT http://localhost:3000/api/contacts/{:id}

---PATCH http://localhost:3000/api/contacts/{:id}/favorite
