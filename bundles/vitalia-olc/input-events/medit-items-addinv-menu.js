'use strict';

/**
 * Mob edit - Adicionar item ao inventário
 */

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const EventUtil     = require(srcPath + 'EventUtil');
  const Logger        = require(srcPath + 'Logger');

  return {
    event: state => (socket, mob, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);

      if (!args.item_selected) args.item_selected = '';

      if (args.item_selected == '') {

        say('-- Adicionar item ao inventário:');
        let printedInvTitle = false;
        if (mob.inventory) {
          for (let inv of mob.inventory) {
            for (let invItem in inv) {
              const item = state.ItemFactory.getDefinition(invItem);
              if (!printedInvTitle) {
                printedInvTitle = true;
                say('Inventário Atual (Item - Chance de Drop):')
              }
              say(sprintf("  [<green>%30s</green>] : <yellow>%20s</yellow> : %s%%", item.name, item.entityReference, inv[invItem]));
          }
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
            return socket.emit('medit-items-menu', socket, mob, args);
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
          return socket.emit('medit-items-addinv-menu', socket, mob, args);
        });
      } else {
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
            return socket.emit('medit-items-addinv-menu', socket, mob, args);
          } else {
            let itemObj = {};
            itemObj[args.item_selected] = val;
            if (!mob.inventory) mob.inventory = [];
            mob.inventory.push(itemObj);
            args.item_selected = '';
            return socket.emit('medit-items-addinv-menu', socket, mob, args);
          }
        });
      }
    }
  };
};
