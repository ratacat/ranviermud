'use strict';

/**
 * Room edit - Remove door from room
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
      options.push({ display: '-- Remover uma porta da sala:' });

      let qttyDoors = 0;
      if (room.doors) {
        const doors = new Map(Object.entries(JSON.parse(JSON.stringify(room.doors || {}))));
        for (const [key, value] of doors) {
          const roomDef = state.RoomManager.getRoom(key);
          let actualFlags = value.flags.join(' ');
          if (actualFlags == '') {
            actualFlags = '<Nenhuma>';
          }
          options.push({
            display: ` [<cyan>${value.name || 'uma porta'}</cyan>] [<green>${value.closed ? 'Fechada' : 'Aberta'}</green>][<green>${value.locked ? 'Trancada' : 'Destrancada'}</green>][<green>${value.lockedBy ? 'Key: <yellow>' + value.lockedBy + '</yellow>': 'Sem chave'}</green>] [<cyan>${key}</cyan>] <cyan>${roomDef.title}</cyan>\r\n Flags: ${actualFlags}\r\n`,
            onSelect: () => {
              delete room.doors[key];
              return socket.emit('redit-doors-menu', socket, room, args);
            },
          });
          qttyDoors++;
        }
      }
      if (qttyDoors == 0) {
        args.errorMsg = 'Não há portas a serem removidas!';
        return socket.emit('redit-doors-menu', socket, room, args);
      }

      options.push({ display: '' });

      let quit = [];
      quit.push({
        display: 'Voltar ao menu anterior',
        onSelect: () => {
          return socket.emit('redit-doors-menu', socket, room, args);
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

      write('Qual porta deseja remover? ');
      socket.once('data', choice => {
        choice = choice.toString().trim().toLowerCase();

        if (choice == 'q') {
          return quit[0].onSelect();
        }

        choice = parseInt(choice, 10) - 1;
        if (isNaN(choice)) {
          args.errorMsg = 'Opção inválida!';
          return socket.emit('redit-doors-menu', socket, room, args);
        }

        const selection = options.filter(o => !!o.onSelect)[choice];

        if (selection) {
          Logger.log('Selecionado redit doors-rem menu ' + selection.display);
          return selection.onSelect(choice);
        }
        args.errorMsg = 'Opção inválida!';
        return socket.emit('redit-doors-menu', socket, room, args);
      });

    }
  };
};
