import { Router } from 'express';
import { uploadImage, deleteImage, bulkDeleteImages } from './upload.controller.js';
import { uploadMiddleware } from '../../middlewares/upload.middleware.js';

const router = Router();

// Endpoint for uploading an image to Cloudinary (using multer middleware for parsing)
router.post('/', uploadMiddleware.single('file'), uploadImage);

// Delete an individual image
router.delete('/:id', deleteImage);

// Bulk delete (useful for page leave cleanup)
router.post('/bulk-delete', bulkDeleteImages);

export { router as uploadRouter };
