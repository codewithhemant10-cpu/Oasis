import express from "express";
import { createHireForm, getAllHireForms, deleteHireForm } from "../controllers/hireFormController.js";

const router = express.Router();

// No extra '/hireform' here, because we mount it in server.js as '/api/hireform'
router.post("/", createHireForm);      // POST /api/hireform
router.get("/", getAllHireForms);      // GET /api/hireform
router.delete("/:id", deleteHireForm); // DELETE /api/hireform/:id

export default router;
