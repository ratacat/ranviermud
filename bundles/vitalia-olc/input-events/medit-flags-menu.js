'use strict';

/**
 * Mob edit - Mob Flags menu
 */

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Logger    = require(srcPath + 'Logger');
  const NpcFlags = require(srcPath + 'NpcFlags');

  return {
    event: state => (socket, mob, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);

      let options = [];
      options.push({ display: `-- Flags de MOB:` });

      let i = 0;
      for (let flag in NpcFlags) {
        options.push({
          display: sprintf("%-20s%s", flag, ++i % 2 === 0 ? '\r\n' : ''),
          onSelect: () => {
            const idx = mob.metadata.npcFlags.indexOf(flag);
            if (idx > -1) {
              mob.metadata.npcFlags.splice(idx, 1);
            } else {
              mob.metadata.npcFlags.push(flag);
            }
            return socket.emit('medit-flags-menu', socket, mob, args);
          },
        });
      }

      options.push({ display: '' });

      let quit = [];
      quit.push({
        display: 'Voltar ao menu principal',
        onSelect: () => {
          return socket.emit('medit-main-menu', socket, mob, args);
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
      if (typeof mob.metadata.npcFlags == 'undefined') {
        mob.metadata.npcFlags = [];
      }
      let actualFlags = mob.metadata.npcFlags.join(' ');
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
          return socket.emit('medit-flags-menu', socket, mob, args);
        }

        const selection = options.filter(o => !!o.onSelect)[choice];

        if (selection) {
          Logger.log('Selecionado medit flags menu ' + selection.display);
          return selection.onSelect();
        }
        args.errorMsg = 'Opção inválida!';
        return socket.emit('medit-flags-menu', socket, mob, args);
      });
    }
  };
};
