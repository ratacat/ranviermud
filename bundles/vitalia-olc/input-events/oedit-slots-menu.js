'use strict';

/**
 * Item edit - Item Type menu
 */

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Logger    = require(srcPath + 'Logger');
  const ItemSlots = require(srcPath + 'ItemSlots');

  return {
    event: state => (socket, obj, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);

      let options = [];
      options.push({ display: `-- Slots de Item:` });

      let i = 0;
      for (let slot in ItemSlots) {
        options.push({
          display: sprintf("%-20s%s", slot, ++i % 3 === 0 ? '\r\n' : ''),
          onSelect: () => {
            const idx = obj.metadata.slot.indexOf(slot);
            if (idx > -1) {
              obj.metadata.slot.splice(idx, 1);
            } else {
              obj.metadata.slot.push(slot);
            }
            return socket.emit('oedit-slots-menu', socket, obj, args);
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
      if (typeof obj.metadata.slot == 'undefined') {
        obj.metadata.slot = [];
      }
      let actualSlots = obj.metadata.slot.join(' ');
      if (actualSlots == '') {
        actualSlots = '<Nenhuma>';
      }
      say(`Slots atuais: ${actualSlots}`);
      if (typeof args.errorMsg != 'undefined' && args.errorMsg != '') {
        say(`<red>${args.errorMsg}</red>`);
        args.errorMsg = '';
      }
      write('Entre com o slot : ');

      socket.once('data', choice => {
        choice = choice.toString().trim().toLowerCase();

        if (choice == 'q') {
          return quit[0].onSelect();
        }
        
        choice = parseInt(choice, 10) - 1;
        if (isNaN(choice)) {
          args.errorMsg = 'Opção inválida!';
          return socket.emit('oedit-slots-menu', socket, obj, args);
        }

        const selection = options.filter(o => !!o.onSelect)[choice];

        if (selection) {
          Logger.log('Selecionado oedit slots menu ' + selection.display);
          return selection.onSelect();
        }
        args.errorMsg = 'Opção inválida!';
        return socket.emit('oedit-slots-menu', socket, obj, args);
      });
    }
  };
};
