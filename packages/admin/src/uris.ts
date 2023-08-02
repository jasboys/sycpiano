/// <reference types="vite/client" />

export const HOST = import.meta.env.PUBLIC_HOST;
export const AUTH_URI = '/auth';
export const ADMIN_URI = '/rest';
export const STATIC_URI = `${HOST}/static`;
export const IMAGES_URI = `${STATIC_URI}/images`;
export const DISC_THUMB_URI = `${IMAGES_URI}/cd-thumbnails`;
