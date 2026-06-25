import ServiceForm from "../models/ServiceForm.js";

// Create a new form submission
export const createServiceForm = async (req, res) => {
  try {
    const form = new ServiceForm(req.body);
    await form.save();
    res.status(201).json({ message: "Form submitted successfully", form });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Get all form submissions
export const getAllServiceForms = async (req, res) => {
  try {
    const forms = await ServiceForm.find().sort({ createdAt: -1 });
    res.status(200).json(forms);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Delete a form submission by ID
export const deleteServiceForm = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ServiceForm.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Form not found" });
    res.status(200).json({ message: "Form deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
