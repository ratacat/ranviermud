'use strict';

/**
 * Room edit - Remove mob from room
 */

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const EventUtil     = require(srcPath + 'EventUtil');
  const Logger        = require(srcPath + 'Logger');

  return {
    event: state => (socket, room, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);

      let options = [];
      options.push({ display: '-- Remover um mob da sala:' });

      let qttyNpcs = 0;
      if (room.npcs && room.npcs.length > 0) {
        for (let npc in room.npcs) {
          const npcDef = state.MobFactory.getDefinition(room.npcs[npc].id);
          options.push({
            display: ` Chance: [<cyan>${room.npcs[npc].respawnChance}%</cyan>] Máximo: [<cyan>${room.npcs[npc].maxLoad ? room.npcs[npc].maxLoad : 1}</cyan>] (<green>${npcDef.entityReference}</green>) <yellow>${npcDef.name}</yellow>\r\n`,
            onSelect: (choice) => {
              choice = parseInt(choice);
              room.npcs.splice(choice, 1);
              return socket.emit('redit-npcs-menu', socket, room, args);
            },
          });
          qttyNpcs++;
        }
      }
      if (qttyNpcs == 0) {
        args.errorMsg = 'Não há mobs a serem removidos!';
        return socket.emit('redit-npcs-menu', socket, room, args);
      }

      options.push({ display: '' });

      let quit = [];
      quit.push({
        display: 'Voltar ao menu anterior',
        onSelect: () => {
          return socket.emit('redit-npcs-menu', socket, room, args);
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

      write('Qual mob deseja remover? ');
      socket.once('data', choice => {
        choice = choice.toString().trim().toLowerCase();

        if (choice == 'q') {
          return quit[0].onSelect();
        }

        choice = parseInt(choice, 10) - 1;
        if (isNaN(choice)) {
          args.errorMsg = 'Opção inválida!';
          return socket.emit('redit-npcs-menu', socket, room, args);
        }

        const selection = options.filter(o => !!o.onSelect)[choice];

        if (selection) {
          Logger.log('Selecionado redit npcs-rem menu ' + selection.display);
          return selection.onSelect(choice);
        }
        args.errorMsg = 'Opção inválida!';
        return socket.emit('redit-npcs-menu', socket, room, args);
      });

    }
  };
};
