import express from "express";
import cors from "cors";
import orderRouter from "./routes/order";
import depthRouter from "./routes/depth";

const PORT = 3000;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/order", orderRouter);
app.use("/api/v1/depth", depthRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ...`);
});
