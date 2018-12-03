'use strict';

/**
 * Room edit - Room Flags menu
 */

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Logger    = require(srcPath + 'Logger');
  const RoomDoorFlags = require(srcPath + 'RoomDoorFlags');

  return {
    event: state => (socket, room, door, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);

      let options = [];
      options.push({ display: `-- Flags da Porta:` });

      let i = 0;
      for (let flag in RoomDoorFlags) {
        options.push({
          display: sprintf("%-20s%s", flag, ++i % 2 === 0 ? '\r\n' : ''),
          onSelect: () => {
            const idx = door.flags.indexOf(flag);
            if (idx > -1) {
              door.flags.splice(idx, 1);
            } else {
              door.flags.push(flag);
            }
            return socket.emit('redit-doors-flags-menu', socket, room, door, args);
          },
        });
      }

      options.push({ display: '' });

      let quit = [];
      quit.push({
        display: 'Voltar ao menu anterior',
        onSelect: () => {
          return socket.emit('redit-doors-edit-menu', socket, room, args);
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
      if (typeof door.flags == 'undefined') {
        door.flags = [];
      }
      let actualFlags = door.flags.join(' ');
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
          return socket.emit('redit-doors-flags-menu', socket, room, door, args);
        }

        const selection = options.filter(o => !!o.onSelect)[choice];

        if (selection) {
          Logger.log('Selecionado redit flags menu ' + selection.display);
          return selection.onSelect();
        }
        args.errorMsg = 'Opção inválida!';
        return socket.emit('redit-doors-flags-menu', socket, room, door, args);
      });
    }
  };
};
