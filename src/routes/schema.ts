import { Router } from "express";
import { loadData } from "../data";
import { deriveSchema } from "../schema";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const data = await loadData();
    const schema = deriveSchema(data);
    res.json(schema);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to derive schema" });
  }
});

export default router;
