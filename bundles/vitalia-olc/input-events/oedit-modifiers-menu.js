'use strict';

/**
 * Item edit - Item Type menu
 */

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const EventUtil     = require(srcPath + 'EventUtil');
  const Logger        = require(srcPath + 'Logger');
  const ItemModifiers = require(srcPath + 'ItemModifiers');

  return {
    event: state => (socket, obj, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);

      if (!args.mod_selected) args.mod_selected = '';
      if (!obj.metadata.stats) obj.metadata.stats = {};

      if (args.mod_selected == '') {
        say('-- Modificadores do Item:');
        // Select the modifier
        let i = 0;
        let modifiers = [];
        for (let modifier in ItemModifiers) {
          modifiers.push(modifier.toLowerCase());
          write(sprintf("%-20s", modifier));
          if (++i % 3 === 0) {
            say('');
          }
        }
        say('');
        let printedTitle = false;
        for (let mod in obj.metadata.stats) {
          if (!printedTitle) {
            say('Modificadores atuais:');
            printedTitle = true;
          }
          say(sprintf("<green>%15s</green> : <yellow>%s</yellow>", mod, obj.metadata.stats[mod]));
        }
        say('');
        say('[<green>Q</green>]  Voltar ao menu principal');
        say('');
        if (typeof args.errorMsg != 'undefined' && args.errorMsg != '') {
          say(`<red>${args.errorMsg}</red>`);
          args.errorMsg = '';
        }

        write('Digite o modificador: ');
        socket.once('data', val => {
          val = val.toString().trim().toUpperCase();
          if (val == 'Q') {
            args.mod_selected = '';
            return socket.emit('oedit-main-menu', socket, obj, args);
          }
          let quantityStr = '';
          if (val.indexOf(' ') >= 0) {
            quantityStr = val.split(' ')[1].toString().trim();
            val = val.split(' ')[0].toString().trim();
          }
          let idx = modifiers.indexOf(val.toLowerCase());
          if (idx < 0) {
            args.errorMsg = 'Modificador inválido!';
          } else {
            if (quantityStr != '') {
              const quantity = parseInt(quantityStr);
              if (isNaN(quantity) || quantity <= -10000 || quantity > 10000) {
                args.errorMsg = 'Número inválido!';
                return socket.emit('oedit-modifiers-menu', socket, obj, args);
              }
              if (quantity == 0) {
                if (obj.metadata.stats[val + '']) {
                  delete obj.metadata.stats[val + ''];
                }
              } else {
                obj.metadata.stats[val + ''] = quantity;
              }
            } else {
              args.mod_selected = val;
            }
          }
          return socket.emit('oedit-modifiers-menu', socket, obj, args);
        });
      } else {
        // Select the quantity
        say('');
        if (typeof args.errorMsg != 'undefined' && args.errorMsg != '') {
          say(`<red>${args.errorMsg}</red>`);
          args.errorMsg = '';
        }
        write('Entre a quantidade do modificador: ');
        socket.once('data', val => {
          val = parseFloat(val, 10);
          if (isNaN(val) || val <= -10000 || val > 10000) {
            args.errorMsg = 'Número inválido!';
            return socket.emit('oedit-modifiers-menu', socket, obj, args);
          } else {
            if (val == 0) {
              if (obj.metadata.stats[args.mod_selected + '']) {
                delete obj.metadata.stats[args.mod_selected + ''];
              }
            } else {
              obj.metadata.stats[args.mod_selected + ''] = val;
            }
            args.mod_selected = '';
            return socket.emit('oedit-modifiers-menu', socket, obj, args);
          }
        });
      }
    }
  };
};
