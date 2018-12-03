'use strict';

/**
 * Room edit - Remove item from room
 */

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const EventUtil     = require(srcPath + 'EventUtil');
  const Logger        = require(srcPath + 'Logger');

  return {
    event: state => (socket, room, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);

      let options = [];
      options.push({ display: '-- Remover um item da sala:' });

      let qttyItems = 0;
      if (room.items && room.items.length > 0) {
        for (let item in room.items) {
          const itemDef = state.ItemFactory.getDefinition(room.items[item].id);
          options.push({
            display: ` Chance: [<cyan>${room.items[item].respawnChance}%</cyan>] Substituir: [<cyan>${room.items[item].replaceOnRespawn ? 'Sim' : 'Não'}</cyan>] (<green>${room.items[item].id}</green>) <yellow>${itemDef.name}</yellow>\r\n`,
            onSelect: (choice) => {
              choice = parseInt(choice);
              room.items.splice(choice, 1);
              return socket.emit('redit-items-menu', socket, room, args);
            },
          });
          qttyItems++;
        }
      }
      if (qttyItems == 0) {
        args.errorMsg = 'Não há items a serem removidos!';
        return socket.emit('redit-items-menu', socket, room, args);
      }

      options.push({ display: '' });

      let quit = [];
      quit.push({
        display: 'Voltar ao menu anterior',
        onSelect: () => {
          return socket.emit('redit-items-menu', socket, room, args);
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

      if (typeof args.errorMsg != 'undefined' && args.errorMsg != '') {
        say(`<red>${args.errorMsg}</red>`);
        args.errorMsg = '';
      }

      write('Qual item deseja remover? ');
      socket.once('data', choice => {
        choice = choice.toString().trim().toLowerCase();

        if (choice == 'q') {
          return quit[0].onSelect();
        }

        choice = parseInt(choice, 10) - 1;
        if (isNaN(choice)) {
          args.errorMsg = 'Opção inválida!';
          return socket.emit('redit-items-menu', socket, room, args);
        }

        const selection = options.filter(o => !!o.onSelect)[choice];

        if (selection) {
          Logger.log('Selecionado redit item-rem menu ' + selection.display);
          return selection.onSelect(choice);
        }
        args.errorMsg = 'Opção inválida!';
        return socket.emit('redit-items-menu', socket, room, args);
      });

    }
  };
};
