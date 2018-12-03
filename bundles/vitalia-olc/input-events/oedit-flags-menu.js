'use strict';

/**
 * Item edit - Item Type menu
 */

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Logger    = require(srcPath + 'Logger');
  const ItemFlags = require(srcPath + 'ItemFlags');

  return {
    event: state => (socket, obj, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);

      let options = [];
      options.push({ display: `-- Flags de Item:` });

      let i = 0;
      for (let flag in ItemFlags) {
        options.push({
          display: sprintf("%-20s%s", flag, ++i % 2 === 0 ? '\r\n' : ''),
          onSelect: () => {
            const idx = obj.metadata.flags.indexOf(flag);
            if (idx > -1) {
              obj.metadata.flags.splice(idx, 1);
            } else {
              obj.metadata.flags.push(flag);
            }
            return socket.emit('oedit-flags-menu', socket, obj, args);
          },
        });
      }

      options.push({ display: '' });

      let quit = [];
      quit.push({
        display: 'Voltar ao menu principal',
        onSelect: () => {
          return socket.emit('oedit-main-menu', socket, obj, args);
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

      say(`[<green>Q</green>]  ${quit[0].display}`);
      say('');
      if (typeof obj.metadata.flags == 'undefined') {
        obj.metadata.flags = [];
      }
      let actualFlags = obj.metadata.flags.join(' ');
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
          return socket.emit('oedit-flags-menu', socket, obj, args);
        }

        const selection = options.filter(o => !!o.onSelect)[choice];

        if (selection) {
          Logger.log('Selecionado oedit flags menu ' + selection.display);
          return selection.onSelect();
        }
        args.errorMsg = 'Opção inválida!';
        return socket.emit('oedit-flags-menu', socket, obj, args);
      });
    }
  };
};
