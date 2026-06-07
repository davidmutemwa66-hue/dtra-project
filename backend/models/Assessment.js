const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  // Organisation info
  organisation: { type: String, required: true, trim: true },
  respondentName: { type: String, required: true, trim: true },
  respondentRole: { type: String, trim: true, default: '' },
  sector: {
    type: String,
    enum: ['Banking & Finance', 'Healthcare', 'Education', 'Government / Public Sector',
           'Agriculture', 'Mining', 'Retail & Commerce', 'Telecommunications',
           'Manufacturing', 'NGO / Non-Profit', 'Other'],
    default: 'Other'
  },
  orgSize: {
    type: String,
    enum: ['1–10 employees', '11–50 employees', '51–200 employees',
           '201–500 employees', '500+ employees'],
    default: '11–50 employees'
  },

  // Raw responses: 5 dimensions x 5 questions, values 1–5
  responses: {
    type: [[Number]],
    required: true,
    validate: {
      validator: v => v.length === 5 && v.every(dim => dim.length === 5),
      message: 'Responses must be a 5x5 array'
    }
  },

  // Computed scores
  scores: {
    technology:  { type: Number, min: 5, max: 25 },
    strategy:    { type: Number, min: 5, max: 25 },
    leadership:  { type: Number, min: 5, max: 25 },
    culture:     { type: Number, min: 5, max: 25 },
    skills:      { type: Number, min: 5, max: 25 },
    total:       { type: Number, min: 25, max: 125 },
    percentage:  { type: Number, min: 0, max: 100 }
  },

  tier: {
    type: String,
    enum: ['Initial', 'Emerging', 'Developing', 'Progressing', 'Leading']
  },

  completedAt: { type: Date, default: Date.now }
});

// Auto-compute scores before saving
assessmentSchema.pre('save', function (next) {
  const dimKeys = ['technology', 'strategy', 'leadership', 'culture', 'skills'];
  let total = 0;
  dimKeys.forEach((key, i) => {
    const dimScore = this.responses[i].reduce((a, b) => a + b, 0);
    this.scores[key] = dimScore;
    total += dimScore;
  });
  this.scores.total = total;
  this.scores.percentage = Math.round(total / 125 * 100);

  const pct = this.scores.percentage;
  if (pct <= 39)      this.tier = 'Initial';
  else if (pct <= 54) this.tier = 'Emerging';
  else if (pct <= 69) this.tier = 'Developing';
  else if (pct <= 84) this.tier = 'Progressing';
  else                this.tier = 'Leading';

  next();
});

module.exports = mongoose.model('Assessment', assessmentSchema);
