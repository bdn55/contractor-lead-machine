const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const authMiddleware = require('../middleware/auth');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Get all leads for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM leads WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get leads error:', err);
    res.status(500).json({ error: 'Failed to get leads' });
  }
});

// Create a lead
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, company, phone, email, address, trade, status, notes } = req.body;
    
    const result = await pool.query(
      `INSERT INTO leads (user_id, name, company, phone, email, address, trade, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [req.user.userId, name, company, phone, email, address, trade, status || 'new', notes]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Create lead error:', err);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// Update a lead
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, company, phone, email, address, trade, status, notes } = req.body;
    
    const result = await pool.query(
      `UPDATE leads SET name=$1, company=$2, phone=$3, email=$4, address=$5, trade=$6, status=$7, notes=$8, updated_at=NOW()
       WHERE id=$9 AND user_id=$10 RETURNING *`,
      [name, company, phone, email, address, trade, status, notes, req.params.id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update lead error:', err);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// Delete a lead
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM leads WHERE id=$1 AND user_id=$2', [req.params.id, req.user.userId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete lead error:', err);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

module.exports = router;
