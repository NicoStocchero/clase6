import express from "express";
import viewsRouter from "./routes/views.router.js";
import hbs from "express-handlebars";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const messages = [];

io.on("connection", (socket) => {
    console.log("Nuevo cliente conectado: ", socket.id);

    socket.emit("all-messages", messages);

    socket.on("login", (username) => {
        socket.broadcast.emit("new-user", username);
    });

    socket.on("new-message", (data) => {
        messages.push(data);
        io.emit("all-messages", messages);
    });

});

// Configurar handlebars (plantillas)
app.engine("handlebars", hbs.engine()); // 1. Configurar el motor de plantillas
app.set("views", import.meta.dirname + "/views"); // 2. Configurar la carpeta de vistas
app.set("view engine", "handlebars"); // 3. Configurar el motor de plantillas

// Middleware para servir archivos estáticos
app.use(express.static(import.meta.dirname + "/public"));

// Rutas (endpoints)
app.use("/", viewsRouter);

server.listen(8080, () => {
  console.log("Server is running on port 8080");
});