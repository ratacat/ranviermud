'use strict';

/**
 * Room edit - Adicionar item a sala
 */

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const EventUtil     = require(srcPath + 'EventUtil');
  const Logger        = require(srcPath + 'Logger');

  return {
    event: state => (socket, room, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);

      if (!args.item_selected) args.item_selected = '';
      if (!args.chance_selected) args.chance_selected = '';

      if (args.item_selected == '') {
        say('-- Adicionar item a sala:');
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

        // Select the modifier
        say('');
        say('[<green>Q</green>]  Voltar ao menu anterior');
        say('');
        if (typeof args.errorMsg != 'undefined' && args.errorMsg != '') {
          say(`<red>${args.errorMsg}</red>`);
          args.errorMsg = '';
        }

        write('Digite o ID do item a adicionar (exemplo: midgaard:1) : ');
        socket.once('data', val => {
          val = val.toString().trim().toLowerCase();
          if (val == 'q') {
            args.item_selected = '';
            return socket.emit('redit-items-menu', socket, room, args);
          }

          // Find the item
          if (val.indexOf(':') < 0) {
            args.errorMsg = 'ID inválido! Insira no formato area:id (Exemplo: midgaard:10)';
          } else {
            const checkitem = state.ItemFactory.getDefinition(val);
            if (!checkitem) {
              args.errorMsg = `ID <yellow>${val}</yellow> inexistente.`;
            } else {
              // Valid item
              args.item_selected = val;
            }
          }
          return socket.emit('redit-items-add-menu', socket, room, args);
        });
      } else {
        if (args.chance_selected == '') {
          // Select the chance
          say('');
          if (typeof args.errorMsg != 'undefined' && args.errorMsg != '') {
            say(`<red>${args.errorMsg}</red>`);
            args.errorMsg = '';
          }
          say('Chance de drop do item (em %): ');
          say('Exemplo: 10');
          say('Exemplo: 1.5');
          write('Entre a chance de drop do item (em %): ');
          socket.once('data', val => {
            val = val.toString().replace(/,/g, '.');
            val = parseFloat(val, 10);
            if (isNaN(val) || val < 0 || val > 100) {
              args.errorMsg = 'Chance inválida!';
              return socket.emit('redit-items-add-menu', socket, room, args);
            } else {
              args.chance_selected = val;
              return socket.emit('redit-items-add-menu', socket, room, args);
            }
          });
        } else {
          // Replace on Load
          say('');
          if (typeof args.errorMsg != 'undefined' && args.errorMsg != '') {
            say(`<red>${args.errorMsg}</red>`);
            args.errorMsg = '';
          }
          say('Substituir ao recarregar? ');
          say('Um baú com itens dentro ao ser substituído, roda as chances de carregar o conteúdo novamente.');
          say('Se um baú não substutir, o conteúdo do baú não é recarregado em reset da área.')
          write('Deseja substituir o item ao recarregar? [<b>s/N</b>]: ');
          socket.once('data', confirmation => {
            say('');
            confirmation = confirmation.toString().trim().toLowerCase();

            if (!/[sn]/.test(confirmation)) {
              args.errorMsg = 'Resposta inválida!';
              return socket.emit('redit-items-add-menu', socket, room, args);
            }

            let replace = false;
            if (confirmation === 's') {
              replace = true;
            }

            let itemroom = {};
            itemroom.id = args.item_selected;
            itemroom.respawnChance = args.chance_selected;
            itemroom.replaceOnRespawn = replace;
            if (!room.items) room.items = [];
            room.items.push(itemroom);
            args.item_selected = '';
            args.chance_selected = '';
            return socket.emit('redit-items-add-menu', socket, room, args);
          });
        }
      }
    }
  };
};
