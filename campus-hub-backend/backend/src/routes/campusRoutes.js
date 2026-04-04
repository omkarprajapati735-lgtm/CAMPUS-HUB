const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  listCampuses,
  getCampus,
  createCampus,
  updateCampus,
  deleteCampus,
  healthCheck
} = require('../controllers/campusController');

const router = express.Router();

router.get('/health', healthCheck);
router.get('/', listCampuses);
router.get('/:id', getCampus);
router.post('/', authMiddleware, upload.single('banner'), createCampus);
router.put('/:id', authMiddleware, upload.single('banner'), updateCampus);
router.delete('/:id', authMiddleware, deleteCampus);

module.exports = router;
