const app = require("./app");
const connectDatabase = require("./config/database");

const dotenv = require("dotenv");

// Handle Uncaught Exception
process.on("uncaughtException", (err) => {
    console.log(`ERROR: ${err.stack}`);
    console.log(`Shutting down the server due to Uncaught Exception.`);
    process.exit(1);
});

// Setting up config file
dotenv.config({ path: "backend/config/.env" });

//Connecting to database
connectDatabase();


const server = app.listen(process.env.PORT, () => {
    console.log(
            `Server started on http://localhost:${process.env.PORT} in ${process.env.NODE_ENV} mode.`
    );
});

// Handle Unhandled Promise rejections
process.on("unhandledRejection", (err) => {
    console.log(`ERROR: ${err.stack}`);
    console.log(`Shutting down the server due to Unhandled Promise rejection.`);
    server.close(() => {
    process.exit(1);
    });
});