import HireForm from "../models/HireForm.js";

// Create a new form submission
export const createHireForm = async (req, res) => {
  try {
    const form = new HireForm(req.body);
    await form.save();
    res.status(201).json({ message: "Form submitted successfully", form });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Get all form submissions
export const getAllHireForms = async (req, res) => {
  try {
    const forms = await HireForm.find().sort({ createdAt: -1 });
    res.status(200).json(forms);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Delete a form submission by ID
export const deleteHireForm = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await HireForm.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Form not found" });
    res.status(200).json({ message: "Form deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
