import express from "express";
import schemaRouter from "./routes/schema";
import dataRouter from "./routes/data";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/schema", schemaRouter);
app.use("/data", dataRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
