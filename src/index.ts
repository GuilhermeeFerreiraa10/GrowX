import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import userRouter from "./routes/user.router"; 
import tweetRouter from "./routes/tweet.router";
import likeRouter from "./routes/like.router";
import followRouter from "./routes/follow.router";

const app = express();
app.use(cors());
app.use(express.json());

app.use(userRouter); 
app.use(tweetRouter);
app.use(likeRouter);
app.use(followRouter);

const publicPath = path.resolve(__dirname, ".."); 

app.get("/", (req, res) => {
    res.sendFile(path.join(publicPath, "index.html")); 
});
app.use("/css", express.static(path.join(publicPath, "css")));
app.use("/js", express.static(path.join(publicPath, "js")));
app.use("/assets", express.static(path.join(publicPath, "assets")));

const PORT = Number(process.env.PORT) || 3333;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor pronto na porta ${PORT}`);
});

export default app;