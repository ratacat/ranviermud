'use strict';

/**
 * Room edit - Adicionar Mob a sala
 */

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const EventUtil     = require(srcPath + 'EventUtil');
  const Logger        = require(srcPath + 'Logger');

  return {
    event: state => (socket, room, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);

      if (!args.npc_selected) args.npc_selected = '';
      if (!args.chance_selected) args.chance_selected = '';

      if (args.npc_selected == '') {
        say('-- Adicionar mob a sala:');
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

        // Select the modifier
        say('');
        say('[<green>Q</green>]  Voltar ao menu anterior');
        say('');
        if (typeof args.errorMsg != 'undefined' && args.errorMsg != '') {
          say(`<red>${args.errorMsg}</red>`);
          args.errorMsg = '';
        }

        write('Digite o ID do mob a adicionar (exemplo: midgaard:1) : ');
        socket.once('data', val => {
          val = val.toString().trim().toLowerCase();
          if (val == 'q') {
            args.npc_selected = '';
            return socket.emit('redit-npcs-menu', socket, room, args);
          }

          // Find the item
          if (val.indexOf(':') < 0) {
            args.errorMsg = 'ID inválido! Insira no formato area:id (Exemplo: midgaard:10)';
          } else {
            const checknpc = state.MobFactory.getDefinition(val);
            if (!checknpc) {
              args.errorMsg = `ID <yellow>${val}</yellow> inexistente.`;
            } else {
              // Valid item
              args.npc_selected = val;
            }
          }
          return socket.emit('redit-npcs-add-menu', socket, room, args);
        });
      } else {
        if (args.chance_selected == '') {
          // Select the chance
          say('');
          if (typeof args.errorMsg != 'undefined' && args.errorMsg != '') {
            say(`<red>${args.errorMsg}</red>`);
            args.errorMsg = '';
          }
          say('Chance de carregamento do mob (em %): ');
          say('Exemplo: 10');
          say('Exemplo: 1.5');
          write('Entre a chance de carregar o mob (em %): ');
          socket.once('data', val => {
            val = val.toString().replace(/,/g, '.');
            val = parseFloat(val, 10);
            if (isNaN(val) || val < 0 || val > 100) {
              args.errorMsg = 'Chance inválida!';
              return socket.emit('redit-npcs-add-menu', socket, room, args);
            } else {
              args.chance_selected = val;
              return socket.emit('redit-npcs-add-menu', socket, room, args);
            }
          });
        } else {
          // Max Npcs on Load
          say('');
          if (typeof args.errorMsg != 'undefined' && args.errorMsg != '') {
            say(`<red>${args.errorMsg}</red>`);
            args.errorMsg = '';
          }
          say('Qual máximo deste mob sendo carregado por esta sala? ');
          say('Se o valor for omitido, vai usar o padrão - 1.');
          say('Zero (0) significa que não será carregado.')
          write('Entre com o máximo deste mob sendo carregado por esta sala: ');
          socket.once('data', max => {
            say('');
            max = max.toString().trim();
            max = parseInt(max);

            if (isNaN(max) || max < 0 || max > 20) {
              args.errorMsg = 'Resposta inválida!';
              return socket.emit('redit-npcs-add-menu', socket, room, args);
            }

            let npcroom = {};
            npcroom.id = args.npc_selected;
            npcroom.respawnChance = args.chance_selected;
            npcroom.maxLoad = max;
            if (!room.npcs) room.npcs = [];
            room.npcs.push(npcroom);
            args.npc_selected = '';
            args.chance_selected = '';
            return socket.emit('redit-npcs-add-menu', socket, room, args);
          });
        }
      }
    }
  };
};
