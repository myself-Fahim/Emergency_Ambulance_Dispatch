
import { createClient } from "redis";
import config from "../config";

export const redisCLient = createClient({
    username: config.redis_user,
    password: config.redis_password,

    socket: {
        host: config.redis_host,
        port: Number(config.redis_port),

        reconnectStrategy: (retries) => {
            console.log(`Redis reconnect attempt: ${retries}`);

            if (retries > 10) {
                console.error("Redis reconnection limit reached!");
                return new Error("Redis reconnection failed!");
            }

            return Math.min(retries * 500, 5000);
        },
    },
});

// Error handling
redisCLient.on("error", (err) => {
    console.error("Redis Client Error:", err);
});

// Connection events
redisCLient.on("connect", () => {
    console.log("Redis connecting...");
});

redisCLient.on("ready", () => {
    console.log("Redis connected successfully!");
});

redisCLient.on("reconnecting", () => {
    console.log("Redis reconnecting...");
});

redisCLient.on("end", () => {
    console.log("Redis connection closed!");
});

// Connect Redis
export const connectRedis = async () => {
    try {
        if (!redisCLient.isOpen) {
            await redisCLient.connect();
        }
    } catch (error) {
        console.error("Failed to connect Redis:", error);
    }
};
