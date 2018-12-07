'use strict';

const sprintf = require('sprintf-js').sprintf;
const Combat = require('../../ranvier-combat/lib/Combat');

module.exports = (srcPath) => {
  const B = require(srcPath + 'Broadcast');

  return {
    aliases: [ 'stats' ],
    command : (state) => (args, p) => {
      const say = message => B.sayAt(p, message);

      say('<b>' + B.center(60, `${p.name}, level ${p.level} ${p.playerClass.config.name}`, 'green'));
      say('<b>' + B.line(60, '-', 'green'));

      let stats = {
        Strength: 0,
        Fortitude: 0,
        Dexterity: 0,
        Reflexes: 0,
        Insight: 0,
        Sensitivity: 0,
        Spirit: 0,
        Luck: 0,
        health: 0,
        armor: 0,
        dodge: 0,
        pulse: 0,
        hitroll: 0,
        damroll: 0,
        critical: 0,
        criticalmultiplier: 0,
        magicfind: 0,
        healmod: 0,
        detection: 0,
        spellpower: 0,
        spiritpower: 0,
        focus: 100
      };

      for (const stat in stats) {
        stats[stat] = {
          current: p.getAttribute(stat) || 0,
          base: p.getBaseAttribute(stat) || 0,
          max: p.getMaxAttribute(stat) || 0,
        };
      }

      B.at(p, sprintf(' %-9s: %12s', 'Health', `${stats.health.current}/${stats.health.max}`));
      say('<b><green>' + sprintf(
        '%36s',
        'Weapon '
      ));

      // class resource
      switch (p.playerClass.id) {
        case 'warrior':
          const energy = {
            current: p.getAttribute('energy'),
            max: p.getMaxAttribute('energy')
          };
          B.at(p, sprintf(' %-9s: %12s', 'Energy', `${energy.current}/${energy.max}`));
          break;
        case 'mage':
          const mana = {
            current: p.getAttribute('mana'),
            max: p.getMaxAttribute('mana')
          };
          B.at(p, sprintf(' %-9s: %12s', 'Mana', `${mana.current}/${mana.max}`));
          break;
        case 'paladin':
          const favor = {
            current: p.getAttribute('favor'),
            max: p.getMaxAttribute('favor')
          };
          B.at(p, sprintf(' %-9s: %12s', 'Favor', `${favor.current}/${favor.max}`));
          break;
        default:
          B.at(p, B.line(24, ' '));
          break;
      }
      say(sprintf('%35s', '.' + B.line(22)) + '.');

      B.at(p, sprintf('%37s', '|'));
      const weaponDamage = Combat.getWeaponDamage(p);
      const min = Combat.normalizeWeaponDamage(p, weaponDamage.min);
      const max = Combat.normalizeWeaponDamage(p, weaponDamage.max);
      say(sprintf(' %6s:<b>%5s</b> - <b>%-5s</b> |', 'Damage', min, max));
      B.at(p, sprintf('%37s', '|'));
      say(sprintf(' %6s: <b>%12s</b> |', 'Speed', B.center(12, Combat.getWeaponSpeed(p) + ' sec')));

      say(sprintf('%60s', "'" + B.line(22) + "'"));

      say('<b><green>' + sprintf(
        '%-24s',
        ' Stats'
      ) + '</green></b>');
      say('.' + B.line(22) + '.');


      const printStat = (stat, newline = true) => {
        const val = stats[stat];
        const statColor = (val.current > val.base ? 'green' : 'white');
        const str = sprintf(
          `| %-9s : <b><${statColor}>%8s</${statColor}></b> |`,
          stat[0].toUpperCase() + stat.slice(1),
          val.current
        );

        if (newline) {
          say(str);
        } else {
          B.at(p, str);
        }
      };

      printStat('Strength', false); // left
      say('<b><green>' + sprintf('%36s', 'Gold ')); // right
      printStat('Reflexes', false); // left
      say(sprintf('%36s', '.' + B.line(12) + '.')); // right
      printStat('Insight', false); // left
      say(sprintf('%22s| <b>%10s</b> |', '', p.getMeta('currencies.gold') || 0)); // right
      printStat('Fortitude', false); // left
      say(sprintf('%36s', "'" + B.line(12) + "'")); // right

      say(':' + B.line(22) + ':');
      printStat('armor');
      printStat('critical');
      say("'" + B.line(22) + "'");
    }
  };
};
