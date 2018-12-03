'use strict';

/**
 * Mob edit - Remove inventory item
 */

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const EventUtil     = require(srcPath + 'EventUtil');
  const Logger        = require(srcPath + 'Logger');

  return {
    event: state => (socket, mob, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);

      let options = [];
      options.push({ display: '-- Remover um item do Inventário:' });

      let qttyItems = 0;
      if (mob.inventory) {
        for (let inv of mob.inventory) {
          for (let invItem in inv) {
            const item = state.ItemFactory.getDefinition(invItem);
            options.push({
              display: sprintf("[<green>%30s</green>] : <yellow>%20s</yellow> : %s%%\r\n", item.name, item.entityReference, inv[invItem]),
              onSelect: (choice) => {
                let loopCount = 0;
                let newInventory = [];
                choice = parseInt(choice);
                for (let inv2 of mob.inventory) {
                  if (loopCount != choice) {
                    newInventory.push(inv2);
                  }
                  loopCount++;
                }
                mob.inventory = newInventory;
                return socket.emit('medit-items-menu', socket, mob, args);
              },
            });
            qttyItems++;
          }
        }
      }
      if (qttyItems == 0) {
        args.errorMsg = 'Não há items a serem removidos!';
        return socket.emit('medit-items-menu', socket, mob, args);
      }

      options.push({ display: '' });

      let quit = [];
      quit.push({
        display: 'Voltar ao menu anterior',
        onSelect: () => {
          return socket.emit('medit-items-menu', socket, mob, args);
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
          return socket.emit('medit-items-menu', socket, mob, args);
        }

        const selection = options.filter(o => !!o.onSelect)[choice];

        if (selection) {
          Logger.log('Selecionado medit item-reminv menu ' + selection.display);
          return selection.onSelect(choice);
        }
        args.errorMsg = 'Opção inválida!';
        return socket.emit('medit-items-menu', socket, mob, args);
      });

    }
  };
};
