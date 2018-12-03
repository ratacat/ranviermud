'use strict';

/**
 * Mob edit - Mob Position menu
 */

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Logger    = require(srcPath + 'Logger');
  const CharPositions = require(srcPath + 'CharPositions');

  return {
    event: state => (socket, mob, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);
      const type     = args.position;
      const title = type == 'position_load' ? 'Posição de Carregamento' : 'Posição Padrão';
      let options = [];
      options.push({ display: `-- ${title} do Mob:` });

      let i = 0;
      for (let pos in CharPositions) {
        options.push({
          display: sprintf("%-20s%s", pos, ++i % 3 === 0 ? '\r\n' : ''),
          onSelect: () => {
            mob.metadata[type] = pos;
            return socket.emit('medit-main-menu', socket, mob, args);
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
      write(`Entre com a ${title} : `);

      socket.once('data', choice => {
        choice = choice.toString().trim().toLowerCase();

        if (choice == 'q') {
          return quit[0].onSelect();
        }
        
        choice = parseInt(choice, 10) - 1;
        if (isNaN(choice)) {
          args.errorMsg = 'Opção inválida!';
          return socket.emit('medit-main-menu', socket, mob, args);
        }

        const selection = options.filter(o => !!o.onSelect)[choice];

        if (selection) {
          Logger.log('Selecionado medit positions menu ' + selection.display);
          return selection.onSelect();
        }
        args.errorMsg = 'Opção inválida!';
        return socket.emit('medit-main-menu', socket, mob, args);
      });
    }
  };
};
