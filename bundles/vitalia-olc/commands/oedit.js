'use strict';

//const LevelUtil = require('../../ranvier-lib/lib/LevelUtil');
const bundlesPath = __dirname + '/../../';

module.exports = (srcPath) => {
  const B           = require(srcPath + 'Broadcast');
  const Data        = require(srcPath + 'Data');
  const bundlesPath = srcPath + '../bundles/';
  const PlayerRoles = require(srcPath + 'PlayerRoles');
  const { CommandParser, InvalidCommandError, RestrictedCommandError, EndCommandLoopError } = require(srcPath + 'CommandParser');
  const PlayerConditions = require(srcPath + 'PlayerConditions');


  return {
    usage: 'oedit <area>:<obj_id>',
    requiredRole: PlayerRoles.GOD_CREATOR,
    command: state => (args, player) => {

      if (!args.length || args.indexOf(':') < 0) {
        B.sayAt(player, 'Editar qual objeto?');
        B.sayAt(player, 'Uso: oedit area:id');
        B.sayAt(player, 'Exemplo: oedit limbo:1');
        return;
      }

      const parts = args.split(':');
      const area = parts[0];
      const id = parts[1];

      if (area === '' || id === '') {
        B.sayAt(player, 'Editar qual objeto?');
        B.sayAt(player, 'Uso: oedit area:id');
        B.sayAt(player, 'Exemplo: oedit limbo:1');
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
      const filepath = areaPath + '/items.yml';

      let parsed = Data.parseFile(filepath);

      // Find the item to modify
      let inObj;
      if (typeof parsed == 'undefined') {
        parsed = [];
      }
      for (let i = 0; i < parsed.length; i++) {
        if (parsed[i].id == id) {
          inObj = parsed[i];
          break;
        }
      }

      if (!inObj) {
        B.sayAt(player, `Objeto ${id} não encontrado na área ${area}.`);
        B.sayAt(player, '<red>Criando novo objeto...</red>');
        //return;
        inObj = {
          'id' : id,
          'entityReference' : area + ':' + id,
          'name'       : 'Objeto inacabado',
          'type'       : 'OTHER',
          'keywords'   : '',
          'roomDesc'   : '',
          'description': '',
          'properties' : {}
        };
        parsed.push(inObj);

      }

      // Todo - criar um file pra dar lock na area, e checar tbm
      player.save();
      player.condition = PlayerConditions.BUILDING;
      player.socket.emit('oedit-main-menu', player.socket, inObj, { player, areaRef, parsed, filepath, areaPath });
    }
  };
};
