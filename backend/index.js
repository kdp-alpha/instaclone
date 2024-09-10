const express = require("express")
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./utils/db");
const userRoute = require("./routes/userRoute")
const postRoute = require("./routes/postRoute");
const messageRoute = require("./routes/messageRoute");
const { app, server } = require('./socket/socket')
const path = require("path")

dotenv.config({});
const PORT = process.env.PORT || 8000;

const dirnamea = path.resolve();


//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
    origin: process.env.URL,
    credentials: true
}
app.use(cors(corsOptions))

//api logic
app.use("/api/v1/user", userRoute)
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute)

app.use(express.static(path.join(dirnamea, "/frontend/dist")));
app.get("*", (req, res) => {
    res.sendFile(path.resolve(dirnamea, "frontend", "dist", "index.html"));
})



server.listen(PORT, () => {
    connectDB();
    console.log(`Server listen at port ${PORT}`);

})
