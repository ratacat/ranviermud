'use strict';

/**
 * Room edit - Room Flags menu
 */

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Logger    = require(srcPath + 'Logger');
  const RoomFlags = require(srcPath + 'RoomFlags');

  return {
    event: state => (socket, room, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);

      let options = [];
      options.push({ display: `-- Flags de Sala:` });

      let i = 0;
      for (let flag in RoomFlags) {
        options.push({
          display: sprintf("%-20s%s", flag, ++i % 2 === 0 ? '\r\n' : ''),
          onSelect: () => {
            const idx = room.metadata.roomFlags.indexOf(flag);
            if (idx > -1) {
              room.metadata.roomFlags.splice(idx, 1);
            } else {
              room.metadata.roomFlags.push(flag);
            }
            return socket.emit('redit-flags-menu', socket, room, args);
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
      if (typeof room.metadata.roomFlags == 'undefined') {
        room.metadata.roomFlags = [];
      }
      let actualFlags = room.metadata.roomFlags.join(' ');
      if (actualFlags == '') {
        actualFlags = '<Nenhuma>';
      }
      say(`Flags atuais: ${actualFlags}`);
      if (typeof args.errorMsg != 'undefined' && args.errorMsg != '') {
        say(`<red>${args.errorMsg}</red>`);
        args.errorMsg = '';
      }
      write('Entre com a flag : ');

      socket.once('data', choice => {
        choice = choice.toString().trim().toLowerCase();

        if (choice == 'q') {
          return quit[0].onSelect();
        }

        choice = parseInt(choice, 10) - 1;
        if (isNaN(choice)) {
          args.errorMsg = 'Opção inválida!';
          return socket.emit('redit-flags-menu', socket, room, args);
        }

        const selection = options.filter(o => !!o.onSelect)[choice];

        if (selection) {
          Logger.log('Selecionado redit flags menu ' + selection.display);
          return selection.onSelect();
        }
        args.errorMsg = 'Opção inválida!';
        return socket.emit('redit-flags-menu', socket, room, args);
      });
    }
  };
};
