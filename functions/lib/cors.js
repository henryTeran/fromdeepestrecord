"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyCors = applyCors;
function applyCors(req, res) {
    const origin = req.headers.origin || "*";
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Credentials", "true");
    res.set("Vary", "Origin");
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return true;
    }
    return false;
}
//# sourceMappingURL=cors.js.map