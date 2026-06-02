import type { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { uploadToCloudinary } from '../../utils/cloudinary.js';
import { prisma } from '../../database/prisma.client.js';
import * as Sentry from '@sentry/node';
import { logger } from '../../utils/logger.util.js';

export const uploadImage = async (req: Request, res: Response): Promise<any> => {
  try {
    /* 
    // Auth Logic for Admin/Editor upload
    // @TODO: Uncomment and integrate with actual session/auth logic
    const userRole = req.user?.role; // Assuming `req.user` is set by an auth middleware
    if (userRole !== 'admin' && userRole !== 'editor') {
      return res.status(403).json({ error: 'Only admins and editors can upload images.' });
    }
    */

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Stream the file buffer to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer);

    // Persist image metadata in the database for tracking/reference
    const image = await prisma.image.create({
      data: {
        url: result.secure_url,
        cloudinaryPublicId: result.public_id,
        // postId is intentionally null — linked to a post when the post is saved/published
      },
    });

    // Return the secure URL and image record id to the frontend
    return res.status(200).json({
      success: true,
      url: image.url,
      imageId: image.id,
    });
  } catch (error) {
    logger.error('Error uploading image to Cloudinary:', error as Record<string, unknown>);
    Sentry.captureException(error);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
};

/**
 * Deletes a single image from both Cloudinary and the database.
 */
export const deleteImage = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  logger.info(`[UploadController] Request to delete image: ${id}`);

  try {
    const image = await prisma.image.findUnique({
      where: { id: id as any },
      select: { id: true, cloudinaryPublicId: true },
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete from Cloudinary if it has a publicId
    if (image.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(image.cloudinaryPublicId);
    }

    // Delete from database
    await prisma.image.delete({ where: { id: id as any } });

    return res.status(200).json({ success: true, message: 'Image deleted' });
  } catch (error) {
    logger.error('Error deleting image:', error as Record<string, unknown>);
    Sentry.captureException(error);
    return res.status(500).json({ error: 'Failed to delete image' });
  }
};

/**
 * Bulk deletes multiple images (useful for page leave cleanup).
 */
export const bulkDeleteImages = async (req: Request, res: Response): Promise<any> => {
  const { imageIds } = req.body;
  logger.info(`[UploadController] Bulk delete request received for ${imageIds?.length || 0} images`);
  logger.info('[UploadController] Image IDs:', imageIds);

  if (!Array.isArray(imageIds)) {
    logger.error('[UploadController] Invalid imageIds format (expected array)');
    return res.status(400).json({ error: 'imageIds must be an array' });
  }

  if (imageIds.length === 0) {
    return res.status(200).json({ success: true, message: 'No images to delete' });
  }

  try {
    const images = await prisma.image.findMany({
      where: { id: { in: imageIds } },
      select: { id: true, cloudinaryPublicId: true },
    });

    const cloudinaryDeletions = images
      .filter((img) => img.cloudinaryPublicId)
      .map((img) => cloudinary.uploader.destroy(img.cloudinaryPublicId!));

    await Promise.allSettled(cloudinaryDeletions);
    await prisma.image.deleteMany({ where: { id: { in: imageIds } } });

    return res.status(200).json({ success: true, message: `${images.length} images deleted` });
  } catch (error) {
    logger.error('Error in bulk image deletion:', error as Record<string, unknown>);
    Sentry.captureException(error);
    return res.status(500).json({ error: 'Failed to delete images' });
  }
};
