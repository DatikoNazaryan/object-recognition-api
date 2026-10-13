import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (
  _req,
  file,
  callback,
) => {
  if (file.mimetype.startsWith('image/')) {
    callback(null, true);
    return;
  }

  callback(
    new Error('Only image files are allowed'),
  );
};

export const avatarUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});