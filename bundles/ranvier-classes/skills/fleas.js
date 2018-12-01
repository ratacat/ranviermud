'use strict';

/**
 * Basic Wanderer Spell
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Damage = require(srcPath + 'Damage');
  const SkillType = require(srcPath + 'SkillType');

  const damagePercent = 140;
  const manaCost = 20;
  const duration = 9 * 1000;
  const tickInterval = 3;

  function getDamage(player) {
    return player.getAttribute('intellect') * (damagePercent / 100);
  }

  return {
    name: 'Fleas',
    type: SkillType.SPELL,
    requiresTarget: true,
    initiatesCombat: true,
    resource: {
      attribute: 'mana',
      cost: manaCost,
    },
    cooldown: 2,

    run: state => function (args, player, target) {
      const effect = state.EffectFactory.create(
        'skill.fleas',
        target,
        {
          duration,
          description: this.info(player),
          tickInterval,
        },
        {
          totalDamage: getDamage(player),
        }
      );
      effect.skill = this;
      effect.attacker = player;


      Broadcast.sayAt(player, `<bold><black>A s<green>w</green>a<green>r</green>m of <red>biting</red> fleas descends upon the </black> <cyan>${target.name}</cyan>!</bold>`);
      Broadcast.sayAtExcept(player.room, `<bold><black>a swarm of <red>biting</red> fleas pours out of ${player.name}'s sleeves enveloping ${target.name}!</bold>`, [player, target]);
      if (!target.isNpc) {
        Broadcast.sayAt(target, `<bold><black>a swarm of <red>biting</red> fleas pours out of ${player.name}'s sleeves enveloping YOU! AhhhhHHH!!!</bold>`);
      }
      target.addEffect(effect);
    },

    info: (player) => {
      return `Send a vicious swarm of fleas at your opponent, doing ${damagePercent}% of your Intellect as Nature damage.`;
    }
  };
};
