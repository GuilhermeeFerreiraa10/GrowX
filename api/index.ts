import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import userRouter from "../src/routes/user.router";
import tweetRouter from "../src/routes/tweet.router";

const app = express();

app.use(cors());
app.use(express.json());

app.use(userRouter); 
app.use(tweetRouter);

const publicPath = path.join(__dirname, ".."); 
app.use("/css", express.static(path.join(publicPath, "css")));
app.use("/js", express.static(path.join(publicPath, "js")));
app.use("/assets", express.static(path.join(publicPath, "assets")));


app.get("/", (req, res) => {
    res.sendFile(path.join(publicPath, "main.html")); 
});

const PORT = Number(process.env.PORT) || 3333;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
    });
}

export default app;