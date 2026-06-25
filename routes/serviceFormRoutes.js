import express from "express";
import { createServiceForm, getAllServiceForms, deleteServiceForm } from "../controllers/serviceFormController.js";

const router = express.Router();

// No extra '/hireform' here, because we mount it in server.js as '/api/hireform'
router.post("/", createServiceForm);      // POST /api/hireform
router.get("/", getAllServiceForms);      // GET /api/hireform
router.delete("/:id", deleteServiceForm); // DELETE /api/hireform/:id

export default router;
