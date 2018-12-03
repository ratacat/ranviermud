'use strict';

/**
 * Item edit - Item Type menu
 */

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Logger    = require(srcPath + 'Logger');
  const ItemAffects = require(srcPath + 'ItemAffects');

  return {
    event: state => (socket, obj, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);

      let options = [];
      options.push({ display: `-- Affects do Item:` });

      let i = 0;
      for (let affect in ItemAffects) {
        options.push({
          display: sprintf("%-20s%s", affect, ++i % 2 === 0 ? '\r\n' : ''),
          onSelect: () => {
            const idx = obj.metadata.affects.indexOf(affect);
            if (idx > -1) {
              obj.metadata.affects.splice(idx, 1);
            } else {
              obj.metadata.affects.push(affect);
            }
            return socket.emit('oedit-affects-menu', socket, obj, args);
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

      say('');
      say(`[<green>Q</green>]  ${quit[0].display}`);
      say('');
      if (typeof obj.metadata.affects == 'undefined') {
        obj.metadata.affects = [];
      }
      let actualAffects = obj.metadata.affects.join(' ');
      if (actualAffects == '') {
        actualAffects = '<Nenhuma>';
      }
      say(`Affects atuais: ${actualAffects}`);
      if (typeof args.errorMsg != 'undefined' && args.errorMsg != '') {
        say(`<red>${args.errorMsg}</red>`);
        args.errorMsg = '';
      }
      write('Entre com o efeito : ');

      socket.once('data', choice => {
        choice = choice.toString().trim().toLowerCase();

        if (choice == 'q') {
          return quit[0].onSelect();
        }

        choice = parseInt(choice, 10) - 1;
        if (isNaN(choice)) {
          args.errorMsg = 'Opção inválida!';
          return socket.emit('oedit-affects-menu', socket, obj, args);
        }

        const selection = options.filter(o => !!o.onSelect)[choice];

        if (selection) {
          Logger.log('Selecionado oedit affects menu ' + selection.display);
          return selection.onSelect();
        }
        args.errorMsg = 'Opção inválida!';
        return socket.emit('oedit-affects-menu', socket, obj, args);
      });
    }
  };
};
