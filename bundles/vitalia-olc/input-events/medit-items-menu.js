'use strict';

/**
 * Mob edit - Item menu (Equipped/Inventory)
 */

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Logger    = require(srcPath + 'Logger');
  const CharSlots = require(srcPath + 'CharSlots');

  return {
    event: state => (socket, mob, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);

      let options = [];
      options.push({ display: `-- Equipamento/Inventário de Item` });
      options.push({ display: 'O quê deseja fazer?' });

      options.push({
        display: 'Adicionar ao inventário',
        onSelect: () => {
          return socket.emit('medit-items-addinv-menu', socket, mob, args);
        }
      });

      let hasInv = false;
      for (let invCheck of mob.inventory) {
        hasInv = true;
        break;
      }

      if (hasInv) {
        options.push({
          display: 'Remover do inventário',
          onSelect: () => {
            return socket.emit('medit-items-reminv-menu', socket, mob, args);
          }
        });
      }

      options.push({
        display: 'Adicionar aos equipados',
        onSelect: () => {
          return socket.emit('medit-items-addeq-menu', socket, mob, args);
        }
      });

      let hasEq = false;
      for (let eqCheck in mob.equipment) {
        hasEq = true;
        break;
      }
      if (hasEq) {
        options.push({
          display: 'Remover dos equipados',
          onSelect: () => {
            return socket.emit('medit-items-remeq-menu', socket, mob, args);
          }
        });
      }

      let quit = [];
      quit.push({
        display: 'Voltar ao menu principal',
        onSelect: () => {
          return socket.emit('medit-main-menu', socket, mob, args);
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
          return socket.emit('medit-items-menu', socket, mob, args);
        }

        const selection = options.filter(o => !!o.onSelect)[choice];

        if (selection) {
          Logger.log('Selecionado medit items menu ' + selection.display);
          return selection.onSelect();
        }
        args.errorMsg = 'Opção inválida!';
        return socket.emit('medit-items-menu', socket, mob, args);
      });
    }
  };
};
