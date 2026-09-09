import type express from 'express';

// Simple CSRF mitigation
export const csrfMiddleware: express.RequestHandler = (req, res, next) => {
    const csrfHeader = req.headers['x-csrf-token'];
    if (csrfHeader === undefined) {
        res.sendStatus(403);
        return;
    }
    next();
};
