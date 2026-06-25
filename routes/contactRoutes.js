import express from "express";
import { createContact, getAllContacts, deleteContact } from "../controllers/contactController.js";

const router = express.Router();

// POST → user submits message
router.post("/", createContact);

// GET → admin fetch all messages
router.get("/", getAllContacts);

// DELETE → admin deletes specific message
router.delete("/:id", deleteContact);

export default router;
