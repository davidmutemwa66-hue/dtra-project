const router = require('express').Router();
const Assessment = require('../models/Assessment');

// POST /api/assessments — save a completed assessment
router.post('/', async (req, res) => {
  try {
    const { organisation, respondentName, respondentRole, sector, orgSize, responses } = req.body;

    if (!organisation || !respondentName || !responses) {
      return res.status(400).json({ error: 'organisation, respondentName, and responses are required' });
    }

    const assessment = new Assessment({
      organisation, respondentName, respondentRole, sector, orgSize, responses
    });

    const saved = await assessment.save();

    res.status(201).json({
      success: true,
      id: saved._id,
      scores: saved.scores,
      tier: saved.tier
    });
  } catch (err) {
    console.error('Save error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// GET /api/assessments — list all (admin overview)
router.get('/', async (req, res) => {
  try {
    const { sector, tier, limit = 100 } = req.query;
    const filter = {};
    if (sector) filter.sector = sector;
    if (tier)   filter.tier = tier;

    const data = await Assessment.find(filter)
      .sort({ completedAt: -1 })
      .limit(parseInt(limit))
      .select('-responses'); // omit raw responses for brevity

    const total = await Assessment.countDocuments(filter);

    res.json({ total, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/assessments/stats — aggregate stats for research analysis
router.get('/stats', async (req, res) => {
  try {
    const totalCount = await Assessment.countDocuments();

    const tierDist = await Assessment.aggregate([
      { $group: { _id: '$tier', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const sectorDist = await Assessment.aggregate([
      { $group: { _id: '$sector', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const avgScores = await Assessment.aggregate([
      { $group: {
        _id: null,
        avgTotal:      { $avg: '$scores.total' },
        avgPct:        { $avg: '$scores.percentage' },
        avgTechnology: { $avg: '$scores.technology' },
        avgStrategy:   { $avg: '$scores.strategy' },
        avgLeadership: { $avg: '$scores.leadership' },
        avgCulture:    { $avg: '$scores.culture' },
        avgSkills:     { $avg: '$scores.skills' }
      }}
    ]);

    res.json({
      totalAssessments: totalCount,
      tierDistribution: tierDist,
      sectorDistribution: sectorDist,
      averageScores: avgScores[0] || {}
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/assessments/:id — single result
router.get('/:id', async (req, res) => {
  try {
    const a = await Assessment.findById(req.params.id);
    if (!a) return res.status(404).json({ error: 'Assessment not found' });
    res.json(a);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
