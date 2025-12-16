const express = require("express");
const {
  listUsers,
  addUser,
  updateUser,
  deleteUser,
  findUserByEmail,
} = require("../data/mockStore");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(listUsers());
});

router.post("/", (req, res) => {
  const { name, email } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: "NameEmailRequired" });
  }

  const existing = findUserByEmail(String(email).toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "EmailExists" });
  }

  const created = addUser(req.body || {});
  res.status(201).json(created);
});

router.put("/:id", (req, res) => {
  const updated = updateUser(Number(req.params.id), req.body || {});
  if (!updated) {
    return res.status(404).json({ error: "UserNotFound" });
  }
  res.json(updated);
});

router.delete("/:id", (req, res) => {
  const success = deleteUser(Number(req.params.id));
  if (!success) {
    return res.status(404).json({ error: "UserNotFound" });
  }
  res.json({ ok: true });
});

module.exports = router;
