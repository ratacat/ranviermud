'use strict';

const bundlesPath = __dirname + '/../../';
const fs = require('fs');

module.exports = (srcPath) => {
  const B           = require(srcPath + 'Broadcast');
  const Data        = require(srcPath + 'Data');
  const PlayerRoles = require(srcPath + 'PlayerRoles');
  const { CommandParser, InvalidCommandError, RestrictedCommandError, EndCommandLoopError } = require(srcPath + 'CommandParser');
  const PlayerConditions = require(srcPath + 'PlayerConditions');


  return {
    usage: 'aedit <area>',
    requiredRole: PlayerRoles.GOD_CREATOR,
    command: state => (args, player) => {

      let areaRef = player.room.area;
      let area = areaRef.name;

      if (args.length) {
        area = args;
      }

      areaRef = state.AreaManager.getArea(area);
      let bundle = 'vitalia-areas';
      if (areaRef) {
        bundle = areaRef.bundle;
      }

      const areaPath = bundlesPath + bundle + '/areas/' + area;
      const filepath = areaPath + '/manifest.yml';

      let parsed;

      if (fs.existsSync(filepath)) {
        parsed = Data.parseFile(filepath);
      }

      if (!parsed) {
        B.sayAt(player, `Area ${area} não encontrada.`);
        B.sayAt(player, '<red>Criando nova área...</red>');
        //return;
        parsed = {
          'title' : 'Nova área (inacabada)',
          'name'  : area,
        };
      }

      // Todo - criar um file pra dar lock na area, e checar tbm
      player.save();
      player.condition = PlayerConditions.BUILDING;
      player.socket.emit('aedit-main-menu', player.socket, parsed, { player, area, areaPath });
    }
  };
};
