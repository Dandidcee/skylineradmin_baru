import { Router } from "express";
import prisma from '../config/db';
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Public route to submit a form response
router.post("/submit", async (req, res) => {
  try {
    const {
      name,
      province,
      city,
      district,
      fullAddress,
      phone,
      needsClass,
      interestLevel,
      joinCommunity,
      communityChannel,
      gender,
      age
    } = req.body;

    const survey = await prisma.surveyResponse.create({
      data: {
        name,
        province,
        city,
        district,
        fullAddress,
        phone,
        needsClass,
        interestLevel,
        joinCommunity,
        communityChannel,
        gender,
        age: age ? parseInt(age.toString()) : null,
      },
    });

    res.status(201).json({ message: "Form submitted successfully", data: survey });
  } catch (error) {
    console.error("Error submitting form:", error);
    res.status(500).json({ error: "Failed to submit form" });
  }
});

// Protected route to get all form responses
router.get("/", authenticateToken, async (req, res) => {
  try {
    const forms = await prisma.surveyResponse.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch forms" });
  }
});

// Protected route to delete a form response
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id as string;
    await prisma.surveyResponse.delete({
      where: { id },
    });
    res.json({ message: "Form response deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete form response" });
  }
});

export default router;
