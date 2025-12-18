const express = require("express");
const {
  listUsers,
  addUser,
  updateUser,
  deleteUser,
  findUserByEmail,
} = require("../data/store");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (err) {
    console.error("USER_FETCH_ERROR:", err);
    res.status(500).json({ error: "UserFetchError" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body || {};
    if (!name || !email) {
      return res.status(400).json({ error: "NameEmailRequired" });
    }

    const existing = await findUserByEmail(String(email).toLowerCase());
    if (existing) {
      return res.status(409).json({ error: "EmailExists" });
    }

    const created = await addUser(req.body || {});
    res.status(201).json(created);
  } catch (err) {
    console.error("USER_CREATE_ERROR:", err);
    res.status(500).json({ error: "UserCreateError" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await updateUser(Number(req.params.id), req.body || {});
    if (!updated) {
      return res.status(404).json({ error: "UserNotFound" });
    }
    res.json(updated);
  } catch (err) {
    console.error("USER_UPDATE_ERROR:", err);
    res.status(500).json({ error: "UserUpdateError" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const success = await deleteUser(Number(req.params.id));
    if (!success) return res.status(404).json({ error: "UserNotFound" });
    res.json({ ok: true, id: Number(req.params.id) });
  } catch (err) {
    console.error("USER_DELETE_ERROR:", err);
    res.status(500).json({ error: "UserDeleteError" });
  }
});

module.exports = router;
