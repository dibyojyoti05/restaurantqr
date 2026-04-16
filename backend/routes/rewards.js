const express = require('express');
const router = express.Router();

// In-memory storage for game rewards (in production, use database)
const gameRewards = new Map();

// Get rewards for a table
router.get('/:tableId', (req, res) => {
  try {
    const { tableId } = req.params;
    const rewards = gameRewards.get(tableId) || {
      totalScore: 0,
      gameStats: { gamesPlayed: 0, highScore: 0, totalPoints: 0 },
      rewards: []
    };
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save rewards for a table
router.post('/:tableId', (req, res) => {
  try {
    const { tableId } = req.params;
    const { totalScore, gameStats, rewards } = req.body;
    
    gameRewards.set(tableId, {
      totalScore,
      gameStats,
      rewards,
      updatedAt: new Date().toISOString()
    });
    
    res.json({ message: 'Rewards saved successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Apply rewards to order (called when generating bill)
router.post('/:tableId/apply/:orderNumber', (req, res) => {
  try {
    const { tableId, orderNumber } = req.params;
    const rewards = gameRewards.get(tableId);
    
    if (!rewards) {
      return res.json({ appliedRewards: [], discount: 0 });
    }
    
    // Mark rewards as claimed
    const claimedRewards = rewards.rewards.map(reward => ({
      ...reward,
      claimed: true,
      appliedToOrder: orderNumber,
      appliedAt: new Date().toISOString()
    }));
    
    // Calculate total discount
    let totalDiscount = 0;
    const freeItems = [];
    
    claimedRewards.forEach(reward => {
      if (reward.reward.includes('5% Discount')) {
        totalDiscount += 0.05;
      } else if (reward.reward.includes('10% Discount')) {
        totalDiscount += 0.10;
      } else if (reward.reward.includes('Free Dessert')) {
        freeItems.push({ name: 'Free Dessert (Game Reward)', originalPrice: 180 });
      } else if (reward.reward.includes('Free Soft Drink')) {
        freeItems.push({ name: 'Free Soft Drink (Game Reward)', originalPrice: 120 });
      } else if (reward.reward.includes('Free Appetizer')) {
        freeItems.push({ name: 'Free Appetizer (Game Reward)', originalPrice: 200 });
      }
    });
    
    // Update stored rewards
    gameRewards.set(tableId, {
      ...rewards,
      rewards: claimedRewards
    });
    
    res.json({
      appliedRewards: claimedRewards,
      discountPercentage: totalDiscount,
      freeItems
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;