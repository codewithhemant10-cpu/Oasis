import Contact from "../models/Contact.js";

// ✅ Create contact (User)
export const createContact = async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;

    if (!name || !phone || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const contact = new Contact({ name, phone, email, message });
    await contact.save();

    res.status(201).json({ message: "Message sent successfully!", contact });
  } catch (error) {
    console.error("Error saving contact:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Get all contacts (Admin)
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Delete contact (Admin)
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json({ message: "Contact deleted successfully!" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
