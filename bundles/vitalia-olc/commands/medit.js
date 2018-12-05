'use strict';

//const LevelUtil = require('../../ranvier-lib/lib/LevelUtil');
const bundlesPath = __dirname + '/../../';

module.exports = (srcPath) => {
  const B           = require(srcPath + 'Broadcast');
  const Data        = require(srcPath + 'Data');
  const bundlesPath = srcPath + '../bundles/';
  const PlayerRoles = require(srcPath + 'PlayerRoles');
  const { CommandParser, InvalidCommandError, RestrictedCommandError, EndCommandLoopError } = require(srcPath + 'CommandParser');
 // const PlayerConditions = require(srcPath + 'PlayerConditions');


  return {
    usage: 'medit <area>:<mob_id>',
    requiredRole: PlayerRoles.GOD_CREATOR,
    command: state => (args, player) => {

      if (!args.length || args.indexOf(':') < 0) {
        B.sayAt(player, 'Editar qual MOB?');
        B.sayAt(player, 'Uso: medit area:id');
        B.sayAt(player, 'Exemplo: medit limbo:1');
        return;
      }

      const parts = args.split(':');
      const area = parts[0];
      const id = parts[1];

      if (area === '' || id === '') {
        B.sayAt(player, 'Editar qual mob?');
        B.sayAt(player, 'Uso: medit area:id');
        B.sayAt(player, 'Exemplo: medit limbo:1');
        return;
      }

      const areaRef = state.AreaManager.getArea(area);
      if (!areaRef) {
        B.sayAt(player, `Área inválida: ${area}`);
        return;
      }

      const bundle = areaRef.bundle;
      if (!areaRef) {
        B.sayAt(player, `Bundle inválido para área: ${area}`);
        return;
      }

      const areaPath = bundlesPath + bundle + '/areas/' + area;
      const filepath = areaPath + '/npcs.yml';

      let parsed = Data.parseFile(filepath);

      // Find the item to modify
      let inMob;
      if (typeof parsed == 'undefined') {
        parsed = [];
      }
      for (let i = 0; i < parsed.length; i++) {
        if (parsed[i].id == id) {
          inMob = parsed[i];
          break;
        }
      }

      if (!inMob) {
        B.sayAt(player, `Mob ${id} não encontrado na área ${area}.`);
        B.sayAt(player, '<red>Criando novo mob...</red>');
        //return;
        inMob = {
          'id' : id,
          'entityReference' : area + ':' + id,
          'name'       : 'Mob inacabado',
          'keywords'   : '',
          'roomDesc'   : '',
          'description': '',
          'metadata'   : {
            'level'      : 1,
            'remort'     : 0,
          }
        };
        parsed.push(inMob);

      }

      // Todo - criar um file pra dar lock na area, e checar tbm
      player.save();
    //  player.condition = PlayerConditions.BUILDING;
      player.socket.emit('medit-main-menu', player.socket, inMob, { player, areaRef, parsed, filepath, areaPath });
    }
  };
};
