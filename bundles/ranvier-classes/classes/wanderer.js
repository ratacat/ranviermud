'use strict';

/**
 * See warrior.js for more on classes.
 */
module.exports = srcPath => {
  return {
    name: 'Wanderer',
    description: 'A weather worn old wanderer, handy with a staff, and deep knowledge of the world.',
    abilityTable: {
      1: { spells: ['fleas'] },
    },

    setupPlayer: player => {
      player.addAttribute('mana', 100);
      player.prompt = '[ %health.current%/%health.max% <b>hp</b> %mana.current%/%mana.max% <b>mana</b> ]';
    }
  };
};
