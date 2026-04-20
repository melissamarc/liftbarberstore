const express = require("express");
const cors = require("cors");
const path = require("path");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const productRoutes = require("./routes/productRoutes");
const saleRoutes = require("./routes/saleRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const rankingRoutes = require("./routes/rankingRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/", (req, res) => {
  res.json({ message: "API LiftBarberStore rodando." });
});

app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/test", testRoutes);
app.use("/products", productRoutes);
app.use("/sales", saleRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/ranking", rankingRoutes);
app.use("/ai", aiRoutes);

module.exports = app;