'use strict';

/**
 * Area edit - Area Flags menu
 */

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Logger    = require(srcPath + 'Logger');
  const AreaFlags = require(srcPath + 'AreaFlags');

  return {
    event: state => (socket, area, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);

      let options = [];
      options.push({ display: `-- Flags de Área:` });

      let i = 0;
      for (let flag in AreaFlags) {
        options.push({
          display: sprintf("%-20s%s", flag, ++i % 2 === 0 ? '\r\n' : ''),
          onSelect: () => {
            const idx = area.info.flags.indexOf(flag);
            if (idx > -1) {
              area.info.flags.splice(idx, 1);
            } else {
              area.info.flags.push(flag);
            }
            return socket.emit('aedit-flags-menu', socket, area, args);
          },
        });
      }

      options.push({ display: '' });

      let quit = [];
      quit.push({
        display: 'Voltar ao menu principal',
        onSelect: () => {
          return socket.emit('aedit-main-menu', socket, area, args);
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
      if (typeof area.info.flags == 'undefined') {
        area.info.flags = [];
      }
      let actualFlags = area.info.flags.join(' ');
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
          return socket.emit('aedit-flags-menu', socket, area, args);
        }

        const selection = options.filter(o => !!o.onSelect)[choice];

        if (selection) {
          Logger.log('Selecionado aedit flags menu ' + selection.display);
          return selection.onSelect();
        }
        args.errorMsg = 'Opção inválida!';
        return socket.emit('aedit-flags-menu', socket, area, args);
      });
    }
  };
};
