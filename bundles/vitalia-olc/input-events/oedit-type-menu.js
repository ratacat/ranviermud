'use strict';

/**
 * Item edit - Item Type menu
 */

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Logger    = require(srcPath + 'Logger');
  const ItemType  = require(srcPath + 'ItemType');

  return {
    event: state => (socket, obj, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);

      let options = [];
      options.push({ display: '<red>Ao trocar o tipo de um item que os players já tem, os itens existentes vão ficar sem nenhuma propriedade específica do <b>novo</b> tipo. Exemplo: Se alterar uma LIGHT para WEAPON, o item que os players já tem vai ficar sem dano algum, ao mudar uma WEAPON para LIGHT, o item que os players tem não vai iluminar. Os itens novos (que resetarem) vão funcionar normalmente.</red>' });
      options.push({ display: '-- Tipos de Item:' });

      let i = 0;
      for (let types in ItemType) {
        options.push({
          display: sprintf("%-20s%s", types, ++i % 2 === 0 ? '\r\n' : ''),
          onSelect: () => {
            obj.type = types;
            return socket.emit('oedit-type-specifics', socket, obj, args);
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
      if (typeof args.errorMsg != 'undefined' && args.errorMsg != '') {
        say(`<red>${args.errorMsg}</red>`);
        args.errorMsg = '';
      }
      write('Entre com o tipo de objeto : ');

      socket.once('data', choice => {
        choice = choice.toString().trim().toLowerCase();

        if (choice == 'q') {
          return quit[0].onSelect();
        }

        choice = parseInt(choice, 10) - 1;
        if (isNaN(choice)) {
          args.errorMsg = 'Opção inválida!';
          return socket.emit('oedit-type-menu', socket, obj, args);
        }

        const selection = options.filter(o => !!o.onSelect)[choice];

        if (selection) {
          Logger.log('Selecionado oedit type menu ' + selection.display);
          return selection.onSelect();
        }
        args.errorMsg = 'Opção inválida!';
        return socket.emit('oedit-type-menu', socket, obj, args);
      });
    }
  };
};
