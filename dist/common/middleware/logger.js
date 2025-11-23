"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
function requestLogger(req, res, next) {
    const start = Date.now();
    console.log(`--> ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('    Body:', JSON.stringify(req.body, null, 2));
    }
    res.on('finish', () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        const statusIcon = status >= 400 ? '✗' : '✓';
        console.log(`<-- ${statusIcon} ${req.method} ${req.path} ${status} (${duration}ms)`);
    });
    next();
}
//# sourceMappingURL=logger.js.map