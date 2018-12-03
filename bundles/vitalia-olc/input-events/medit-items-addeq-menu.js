'use strict';

/**
 * Mob edit - Adicionar item ao equipados
 */

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const EventUtil     = require(srcPath + 'EventUtil');
  const Logger        = require(srcPath + 'Logger');
  const CharSlots     = require(srcPath + 'CharSlots');

  return {
    event: state => (socket, mob, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);

      if (!args.item_selected) args.item_selected = '';

      if (args.item_selected == '') {

        let printedEqTitle = false;
        if (mob.equipment) {
          for (let entry in mob.equipment) {
            for (let eq in mob.equipment[entry]) {
              const equip = state.ItemFactory.getDefinition(eq);
              if (!printedEqTitle) {
                printedEqTitle = true;
                say('Equipamentos Atuais (Lugar - Item - Chance de Drop):')
              }
              say(sprintf("  [<green>%7s</green>] %15s : [<green>%s</green>] : <yellow>%s</yellow> : %s%%", entry, CharSlots[entry].equipDesc, equip.name, equip.entityReference, mob.equipment[entry][eq]));
            }
          }
        }

        say('-- Adicionar item aos equipados:');
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
              args.item_selected_slot = checkitem.slot + '';
              args.item_selected_slot = args.item_selected_slot.toUpperCase();
              if (args.item_selected_slot == 'undefined') args.item_selected_slot = 'HOLD';
              args.item_selected_slot_confirmed = false;
            }
          }
          return socket.emit('medit-items-addeq-menu', socket, mob, args);
        });
      } else {
        // Confirm the Slot
        if (!args.item_selected_slot_confirmed && 
            (args.item_selected_slot == 'EAR' ||
            args.item_selected_slot == 'NECK' ||
            args.item_selected_slot == 'WRIST' ||
            args.item_selected_slot == 'WIELD' ||
            args.item_selected_slot == 'FINGER')) {
          say('');
          say('O item selecionado pode ser equipado em mais de um lugar, escolha o lugar:');
          let availableSlots = [];
          let i = 0;
          for (let slot in CharSlots) {
            if (CharSlots[slot].slot == args.item_selected_slot) {
              availableSlots.push(slot);
              write(sprintf("%-20s", slot));
              if (++i % 3 === 0) {
                say('');
              }
            }
          }
          say('');
          say('[<green>Q</green>]  Voltar ao menu anterior');
          say('');
          write('Entre com o lugar: ');
          socket.once('data', valSlot => {
            valSlot = valSlot.toString().trim().toUpperCase();
            if (valSlot == 'Q') {
              args.item_selected = '';
              args.item_selected_slot = '';
              args.item_selected_slot_confirmed = false;
              return socket.emit('medit-items-menu', socket, mob, args);
            }
            if (!availableSlots.includes(valSlot)) {
                say('<red>Lugar inválido!</red>');
                return socket.emit('medit-items-addeq-menu', socket, mob, args);
            } else {
              args.item_selected_slot = valSlot;
              args.item_selected_slot_confirmed = true;
              return socket.emit('medit-items-addeq-menu', socket, mob, args);
            }
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
              return socket.emit('medit-items-addeq-menu', socket, mob, args);
            } else {
              let itemObj = {};
              itemObj[args.item_selected] = val;
              if (!mob.equipment) mob.equipment = {};
              mob.equipment[args.item_selected_slot] = itemObj;
              args.item_selected = '';
              args.item_selected_slot = '';
              args.item_selected_slot_confirmed = false;
              return socket.emit('medit-items-addeq-menu', socket, mob, args);
            }
          });
        }
      }
    }
  };
};
