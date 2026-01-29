import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import userRouter from "./routes/user.router";
import tweetRouter from "./routes/tweet.router";

const app = express();

app.use(cors());
app.use(express.json());

app.use(userRouter); 
app.use(tweetRouter);

// Servir o Frontend
const rootPath = path.join(__dirname, "..");
app.use("/css", express.static(path.join(rootPath, "css")));
app.use("/js", express.static(path.join(rootPath, "js")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "main.html"));
});

// Garante que a porta seja um número
const PORT = Number(process.env.PORT) || 3333;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
export default app;