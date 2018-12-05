'use strict';

/**
 * Room edit - Npcs menu (Load)
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
      options.push({ display: `-- Mobs carregados na sala` });
      options.push({ display: 'O quê deseja fazer?' });

      options.push({
        display: 'Adicionar mob na sala',
        onSelect: () => {
          return socket.emit('redit-npcs-add-menu', socket, room, args);
        }
      });

      let hasNpc = false;
      if (room.npcs && room.npcs.length > 0) {
        hasNpc = true;
      }

      if (hasNpc) {
        options.push({
          display: 'Remover mob da sala',
          onSelect: () => {
            return socket.emit('redit-npcs-rem-menu', socket, room, args);
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
      if (room.npcs && room.npcs.length > 0) {
        for (let npc in room.npcs) {
          const npcDef = state.MobFactory.getDefinition(room.npcs[npc].id);
          if (!printedTitle) {
            printedTitle = true;
            say('Mobs atuais:')
          }
          say(` Chance: [<cyan>${room.npcs[npc].respawnChance}%</cyan>] Máximo: [<cyan>${room.npcs[npc].maxLoad ? room.npcs[npc].maxLoad : 1}</cyan>] (<green>${npcDef.entityReference}</green>) <yellow>${npcDef.name}</yellow>`);
        }
      }

      if (typeof args.errorMsg != 'undefined' && args.errorMsg != '') {
        say(`<red>${args.errorMsg}</red>`);
        args.errorMsg = '';
      }
      write('Enter your choice : ');

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
          Logger.log('Selecionado redit npcs menu ' + selection.display);
          return selection.onSelect();
        }
        args.errorMsg = 'Opção inválida!';
        return socket.emit('redit-npcs-menu', socket, room, args);
      });
    }
  };
};

