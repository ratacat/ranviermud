'use strict';

const bundlesPath = __dirname + '/../../';

module.exports = (srcPath) => {
  const B           = require(srcPath + 'Broadcast');
  const Data        = require(srcPath + 'Data');
  const PlayerRoles = require(srcPath + 'PlayerRoles');
  const { CommandParser, InvalidCommandError, RestrictedCommandError, EndCommandLoopError } = require(srcPath + 'CommandParser');
 // const PlayerConditions = require(srcPath + 'PlayerConditions');


  return {
    usage: 'redit <area:room_id>',
    requiredRole: PlayerRoles.GOD_CREATOR,
    command: state => (args, player) => {

      let areaRef = player.room.area;
      let id = player.room.id;
      let area = areaRef.name;

      if (args.length) {
        if (args.indexOf(':') < 0) {
          B.sayAt(player, 'Editar qual sala?');
          B.sayAt(player, 'Uso: medit <area:id> - Sem argumentos edita a sala atual');
          B.sayAt(player, 'Exemplo: medit limbo:1');
          return;
        }

        const parts = args.split(':');
        area = parts[0];
        id = parts[1];

        if (area === '' || id === '') {
          B.sayAt(player, 'Editar qual sala?');
          B.sayAt(player, 'Uso: medit area:id');
          B.sayAt(player, 'Exemplo: medit limbo:1');
          return;
        }

        areaRef = state.AreaManager.getArea(area);
        if (!areaRef) {
          B.sayAt(player, `Área inválida: ${area}`);
          return;
        }
      }

      const bundle = areaRef.bundle;
      if (!areaRef) {
        B.sayAt(player, `Bundle inválido para área: ${areaRef.name}`);
        return;
      }

      const areaPath = bundlesPath + bundle + '/areas/' + areaRef.name;
      const filepath = areaPath + '/rooms.yml';

      let parsed = Data.parseFile(filepath);

      // Find the item to modify
      let inRoom;
      if (typeof parsed == 'undefined') {
        parsed = [];
      }
      for (let i = 0; i < parsed.length; i++) {
        if (parsed[i].id == id) {
          inRoom = parsed[i];
          break;
        }
      }

      if (!inRoom) {
        B.sayAt(player, `Sala ${id} não encontrado na área ${area}.`);
        B.sayAt(player, '<red>Criando nova sala...</red>');
        //return;
        inRoom = {
          'id' : id,
          'entityReference' : area + ':' + id,
          'title'       : 'Sala inacabada',
          'description': '',
          'metadata'   : {}
        };
        parsed.push(inRoom);
      }

      // Todo - criar um file pra dar lock na area, e checar tbm
      player.save();
     // player.condition = PlayerConditions.BUILDING;
      player.socket.emit('redit-main-menu', player.socket, inRoom, { player, areaRef, parsed, filepath, areaPath });
    }
  };
};
