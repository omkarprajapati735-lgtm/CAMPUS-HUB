const Campus = require('../models/Campus');
const { sendCampusUpdateNotification } = require('../services/notificationService');
const { uploadImage } = require('../services/fileService');
const { query } = require('../config/database');

async function listCampuses(req, res, next) {
  try {
    const limit = parseInt(req.query.limit || '20', 10);
    const offset = parseInt(req.query.offset || '0', 10);
    const search = req.query.search || '';

    const campuses = await Campus.list({ limit, offset, search });
    return res.json({ campuses });
  } catch (error) {
    return next(error);
  }
}

async function getCampus(req, res, next) {
  try {
    const campus = await Campus.findById(req.params.id);
    if (!campus) return res.status(404).json({ message: 'Campus not found' });
    return res.json({ campus });
  } catch (error) {
    return next(error);
  }
}

async function createCampus(req, res, next) {
  try {
    const { name, location, description } = req.body;
    if (!name || !location) {
      return res.status(400).json({ message: 'name and location are required' });
    }

    let bannerUrl = null;
    if (req.file?.path) {
      const upload = await uploadImage(req.file.path, 'campus-hub/campuses');
      bannerUrl = upload.secure_url;
    }

    const campus = await Campus.create({ name, location, description, bannerUrl });
    return res.status(201).json({ message: 'Campus created', campus });
  } catch (error) {
    return next(error);
  }
}

async function updateCampus(req, res, next) {
  try {
    const updates = {
      name: req.body.name,
      location: req.body.location,
      description: req.body.description
    };

    if (req.file?.path) {
      const upload = await uploadImage(req.file.path, 'campus-hub/campuses');
      updates.bannerUrl = upload.secure_url;
    }

    const campus = await Campus.update(req.params.id, updates);
    if (!campus) return res.status(404).json({ message: 'Campus not found' });

    if (req.body.notifyUserId) {
      await sendCampusUpdateNotification(req.body.notifyUserId, campus.name);
    }

    return res.json({ message: 'Campus updated', campus });
  } catch (error) {
    return next(error);
  }
}

async function deleteCampus(req, res, next) {
  try {
    await Campus.remove(req.params.id);
    return res.json({ message: 'Campus deleted' });
  } catch (error) {
    return next(error);
  }
}

async function healthCheck(req, res, next) {
  try {
    const { rows } = await query('SELECT NOW() AS server_time');
    return res.json({
      status: 'ok',
      serverTime: rows[0].server_time
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listCampuses,
  getCampus,
  createCampus,
  updateCampus,
  deleteCampus,
  healthCheck
};
