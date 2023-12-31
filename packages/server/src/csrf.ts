import express from 'express';

// Simple CSRF mitigation
export const csrfMiddleware: express.RequestHandler = async (
    req,
    res,
    next,
) => {
    const csrfHeader = req.headers['x-csrf-token'];
    if (csrfHeader === undefined) {
        res.sendStatus(403);
        return;
    }
    next();
};
