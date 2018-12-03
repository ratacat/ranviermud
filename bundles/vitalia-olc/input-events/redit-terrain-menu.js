'use strict';

/**
 * Room edit - Room terrain menu
 */

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Logger    = require(srcPath + 'Logger');
  const RoomTerrains = require(srcPath + 'RoomTerrains');

  return {
    event: state => (socket, room, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);
      let options = [];
      options.push({ display: `-- Terreno da Sala:` });

      let i = 0;
      for (let terrain in RoomTerrains) {
        options.push({
          display: sprintf("%-20s%s", RoomTerrains[terrain].name, ++i % 3 === 0 ? '\r\n' : ''),
          onSelect: () => {
            room.metadata.terrain = terrain;
            return socket.emit('redit-main-menu', socket, room, args);
          },
        });
      }

      options.push({ display: '' });

      let quit = [];
      quit.push({
        display: 'Voltar ao menu principal',
        onSelect: () => {
          return socket.emit('redit-main-menu', socket, room, args);
        },
      });

      let optionI = 0;
      options.forEach((opt) => {
        if (opt.onSelect) {
          optionI++;
          write(`[<green>${optionI < 10 ? ' ' : ''}${optionI}</green>] ${opt.display}`);
        } else {
          say(`${opt.display}`);
        }
      });
      
      say('');
      say(`[<green>Q</green>]  ${quit[0].display}`);
      say('');
      write(`Entre com o terreno da sala : `);

      socket.once('data', choice => {
        choice = choice.toString().trim().toLowerCase();

        if (choice == 'q') {
          return quit[0].onSelect();
        }
        
        choice = parseInt(choice, 10) - 1;
        if (isNaN(choice)) {
          args.errorMsg = 'Opção inválida!';
          return socket.emit('redit-terrain-menu', socket, room, args);
        }

        const selection = options.filter(o => !!o.onSelect)[choice];

        if (selection) {
          Logger.log('Selecionado redit terrain menu ' + selection.display);
          return selection.onSelect();
        }
        args.errorMsg = 'Opção inválida!';
        return socket.emit('redit-terrain-menu', socket, room, args);
      });
    }
  };
};
