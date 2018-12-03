'use strict';

/**
 * Room edit - Item menu (Load)
 */

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Logger    = require(srcPath + 'Logger');

  return {
    event: state => (socket, room, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);

      let options = [];
      options.push({ display: `-- Items carregados na sala` });
      options.push({ display: 'O quê deseja fazer?' });

      options.push({
        display: 'Adicionar item na sala',
        onSelect: () => {
          return socket.emit('redit-items-add-menu', socket, room, args);
        }
      });

      let hasItem = false;
      if (room.items && room.items.length > 0) {
        hasItem = true;
      }

      if (hasItem) {
        options.push({
          display: 'Remover item da sala',
          onSelect: () => {
            return socket.emit('redit-items-rem-menu', socket, room, args);
          }
        });
      }

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
          say(`[<green>${optionI < 10 ? ' ' : ''}${optionI}</green>] ${opt.display}`);
        } else {
          say(`${opt.display}`);
        }
      });
      
      say('');
      say(`[<green>Q</green>]  ${quit[0].display}`);
      say('');

      let printedTitle = false;
      if (room.items && room.items.length > 0) {
        for (let item in room.items) {
          const itemDef = state.ItemFactory.getDefinition(room.items[item].id);
          if (!printedTitle) {
            printedTitle = true;
            say('Items atuais:')
          }
          say(` Chance: [<cyan>${room.items[item].respawnChance}%</cyan>] Substituir: [<cyan>${room.items[item].replaceOnRespawn ? 'Sim' : 'Não'}</cyan>] (<green>${room.items[item].id}</green>) <yellow>${itemDef.name}</yellow>`);
        }
      }

      if (typeof args.errorMsg != 'undefined' && args.errorMsg != '') {
        say(`<red>${args.errorMsg}</red>`);
        args.errorMsg = '';
      }
      write('Entre com a opção : ');

      socket.once('data', choice => {
        choice = choice.toString().trim().toLowerCase();

        if (choice == 'q') {
          return quit[0].onSelect();
        }
        
        choice = parseInt(choice, 10) - 1;
        if (isNaN(choice)) {
          args.errorMsg = 'Opção inválida!';
          return socket.emit('redit-items-menu', socket, room, args);
        }

        const selection = options.filter(o => !!o.onSelect)[choice];

        if (selection) {
          Logger.log('Selecionado redit items menu ' + selection.display);
          return selection.onSelect();
        }
        args.errorMsg = 'Opção inválida!';
        return socket.emit('redit-items-menu', socket, room, args);
      });
    }
  };
};

